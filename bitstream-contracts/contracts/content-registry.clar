;; ContentRegistry Contract
;; Manages content NFTs, metadata, and ownership

;; Error constants
(define-constant ERR-CONTENT-NOT-FOUND u1001)
(define-constant ERR-NOT-CONTENT-OWNER u1002)
(define-constant ERR-CONTENT-ALREADY-EXISTS u1003)
(define-constant ERR-INVALID-METADATA u1004)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-INVALID-INPUT u4003)

;; Data variables
(define-data-var content-id-counter uint u0)

;; Data maps
(define-map content-registry
    { content-id: uint }
    {
        creator: principal,
        content-hash: (buff 32),
        metadata-uri: (string-ascii 256),
        price: uint,
        created-at: uint,
        updated-at: uint,
        is-active: bool
    })

;; Content hash to ID mapping for duplicate prevention
(define-map content-hash-to-id
    { content-hash: (buff 32) }
    { content-id: uint })

;; Register new content
(define-public (register-content 
    (content-hash (buff 32))
    (metadata-uri (string-ascii 256))
    (price uint)
    (creator principal))
    (let
        (
            (new-content-id (+ (var-get content-id-counter) u1))
            (current-block-height stacks-block-height)
        )
        ;; Check if content already exists
        (asserts! (is-none (map-get? content-hash-to-id { content-hash: content-hash })) (err ERR-CONTENT-ALREADY-EXISTS))
        
        ;; Validate inputs
        (asserts! (> (len metadata-uri) u0) (err ERR-INVALID-METADATA))
        (asserts! (> price u0) (err ERR-INVALID-INPUT))
        
        ;; Store content information
        (map-set content-registry
            { content-id: new-content-id }
            {
                creator: creator,
                content-hash: content-hash,
                metadata-uri: metadata-uri,
                price: price,
                created-at: current-block-height,
                updated-at: current-block-height,
                is-active: true
            })
        
        ;; Store hash to ID mapping
        (map-set content-hash-to-id
            { content-hash: content-hash }
            { content-id: new-content-id })
        
        ;; Update counter
        (var-set content-id-counter new-content-id)
        
        ;; Return content ID
        (ok new-content-id)))

;; Update content metadata (owner only)
(define-public (update-content-metadata
    (content-id uint)
    (new-metadata-uri (string-ascii 256))
    (new-price uint))
    (let
        (
            (content-info (unwrap! (map-get? content-registry { content-id: content-id }) (err ERR-CONTENT-NOT-FOUND)))
            (current-block-height stacks-block-height)
        )
        ;; Check ownership
        (asserts! (is-eq tx-sender (get creator content-info)) (err ERR-NOT-CONTENT-OWNER))
        
        ;; Validate inputs
        (asserts! (> (len new-metadata-uri) u0) (err ERR-INVALID-METADATA))
        (asserts! (> new-price u0) (err ERR-INVALID-INPUT))
        
        ;; Update content information
        (map-set content-registry
            { content-id: content-id }
            (merge content-info {
                metadata-uri: new-metadata-uri,
                price: new-price,
                updated-at: current-block-height
            }))
        
        (ok true)))

;; Transfer content ownership
(define-public (transfer-content
    (content-id uint)
    (new-owner principal))
    (let
        (
            (content-info (unwrap! (map-get? content-registry { content-id: content-id }) (err ERR-CONTENT-NOT-FOUND)))
        )
        ;; Check ownership
        (asserts! (is-eq tx-sender (get creator content-info)) (err ERR-NOT-CONTENT-OWNER))
        
        ;; Update owner
        (map-set content-registry
            { content-id: content-id }
            (merge content-info {
                creator: new-owner,
                updated-at: stacks-block-height
            }))
        
        (ok true)))

;; Get content information
(define-read-only (get-content-info (content-id uint))
    (map-get? content-registry { content-id: content-id }))

;; Get content ID by hash
(define-read-only (get-content-id-by-hash (content-hash (buff 32)))
    (map-get? content-hash-to-id { content-hash: content-hash }))

;; Get current content counter
(define-read-only (get-content-counter)
    (var-get content-id-counter))

;; Check if content exists and is active
(define-read-only (is-content-active (content-id uint))
    (match (map-get? content-registry { content-id: content-id })
        content-info (get is-active content-info)
        false))