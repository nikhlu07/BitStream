;; AccessControl Contract
;; Manages content access permissions and verification

;; Error constants
(define-constant ERR-ACCESS-DENIED u3001)
(define-constant ERR-ACCESS-ALREADY-GRANTED u3002)
(define-constant ERR-ACCESS-NOT-FOUND u3003)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-INVALID-INPUT u4003)
(define-constant ERR-CONTENT-NOT-FOUND u1001)

;; Data maps
(define-map content-access
    { content-id: uint, viewer: principal }
    {
        granted-at: uint,
        expires-at: (optional uint),
        is-active: bool
    })

;; User's accessible content list (limited to 100 items for efficiency)
(define-map user-content-list
    { viewer: principal }
    { content-ids: (list 100 uint) })

;; Grant access to content (called by PaymentProcessor contract)
(define-public (grant-access
    (content-id uint)
    (viewer principal))
    (let
        (
            (current-block-height stacks-block-height)
        )
        ;; Check if access already granted
        (asserts! (is-none (map-get? content-access { content-id: content-id, viewer: viewer })) (err ERR-ACCESS-ALREADY-GRANTED))
        
        ;; Grant access
        (map-set content-access
            { content-id: content-id, viewer: viewer }
            {
                granted-at: current-block-height,
                expires-at: none,
                is-active: true
            })
        
        ;; Update user's content list
        (begin
            (update-user-content-list viewer content-id)
            (ok true))))

;; Check if user has access to content
(define-read-only (has-access
    (content-id uint)
    (viewer principal))
    (match (map-get? content-access { content-id: content-id, viewer: viewer })
        access-info (and (get is-active access-info)
                        (match (get expires-at access-info)
                            expiry (< stacks-block-height expiry)
                            true))
        false))

;; Revoke access (creator or admin only)
(define-public (revoke-access
    (content-id uint)
    (viewer principal))
    (let
        (
            (access-info (unwrap! (map-get? content-access { content-id: content-id, viewer: viewer }) (err ERR-ACCESS-NOT-FOUND)))
        )
        ;; For now, allow any caller to revoke (in production, would check creator/admin status)
        ;; Revoke access
        (map-set content-access
            { content-id: content-id, viewer: viewer }
            (merge access-info { is-active: false }))
        
        (ok true)))

;; Get all content accessible by user
(define-read-only (get-user-content-access (viewer principal))
    (default-to (list) (get content-ids (map-get? user-content-list { viewer: viewer }))))

;; Get access information for specific content and viewer
(define-read-only (get-access-info (content-id uint) (viewer principal))
    (map-get? content-access { content-id: content-id, viewer: viewer }))

;; Private function to update user's content list
(define-private (update-user-content-list (viewer principal) (content-id uint))
    (let
        (
            (current-list (default-to (list) (get content-ids (map-get? user-content-list { viewer: viewer }))))
        )
        ;; Add content ID to list if not already present and list not full
        (if (and (< (len current-list) u100) (is-none (index-of current-list content-id)))
            (begin
                (map-set user-content-list
                    { viewer: viewer }
                    { content-ids: (unwrap-panic (as-max-len? (append current-list content-id) u100)) })
                true)
            true)))

;; Batch access verification for multiple content items
(define-read-only (has-batch-access (content-ids (list 10 uint)) (viewer principal))
    (map check-single-access content-ids))

;; Helper function for batch access check
(define-private (check-single-access (content-id uint))
    (has-access content-id tx-sender))