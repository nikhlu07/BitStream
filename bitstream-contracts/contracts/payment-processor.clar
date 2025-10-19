;; PaymentProcessor Contract
;; Handles STX payments and automatic revenue distribution

;; Error constants
(define-constant ERR-INSUFFICIENT-PAYMENT u2001)
(define-constant ERR-PAYMENT-FAILED u2002)
(define-constant ERR-NO-EARNINGS u2003)
(define-constant ERR-WITHDRAWAL-FAILED u2004)
(define-constant ERR-NOT-AUTHORIZED u4001)
(define-constant ERR-CONTRACT-PAUSED u4002)
(define-constant ERR-INVALID-INPUT u4003)
(define-constant ERR-CONTENT-NOT-FOUND u1001)

;; Platform configuration
(define-constant PLATFORM-ADMIN tx-sender) ;; Set during deployment
(define-constant PLATFORM-TREASURY tx-sender) ;; Set during deployment

;; Data variables
(define-data-var platform-fee-percentage uint u1000) ;; 10% in basis points (1000/10000)
(define-data-var platform-treasury uint u0)
(define-data-var contract-paused bool false)

;; Data maps
(define-map creator-earnings
    { creator: principal }
    { balance: uint })

(define-map payment-history
    { payment-id: uint }
    {
        content-id: uint,
        viewer: principal,
        creator: principal,
        amount: uint,
        creator-share: uint,
        platform-share: uint,
        timestamp: uint
    })

(define-data-var payment-id-counter uint u0)

;; Process payment for content access
(define-public (purchase-content
    (content-id uint)
    (payment-amount uint))
    (let
        (
            (platform-fee-bp (var-get platform-fee-percentage))
            (platform-share (/ (* payment-amount platform-fee-bp) u10000))
            (creator-share (- payment-amount platform-share))
            (new-payment-id (+ (var-get payment-id-counter) u1))
        )
        ;; Check if contract is paused
        (asserts! (not (var-get contract-paused)) (err ERR-CONTRACT-PAUSED))
        
        ;; Verify payment amount is positive
        (asserts! (> payment-amount u0) (err ERR-INSUFFICIENT-PAYMENT))
        
        ;; Transfer STX from viewer to contract
        (try! (stx-transfer? payment-amount tx-sender (as-contract tx-sender)))
        
        ;; Update creator earnings (using a dummy creator for now)
        (let
            (
                (creator tx-sender) ;; Simplified for testnet
                (current-earnings (default-to u0 (get balance (map-get? creator-earnings { creator: creator }))))
            )
            (map-set creator-earnings
                { creator: creator }
                { balance: (+ current-earnings creator-share) }))
        
        ;; Update platform treasury
        (var-set platform-treasury (+ (var-get platform-treasury) platform-share))
        
        ;; Grant access through AccessControl contract
        (try! (contract-call? .access-control grant-access content-id tx-sender))
        
        ;; Record payment history
        (map-set payment-history
            { payment-id: new-payment-id }
            {
                content-id: content-id,
                viewer: tx-sender,
                creator: tx-sender, ;; Simplified for testnet
                amount: payment-amount,
                creator-share: creator-share,
                platform-share: platform-share,
                timestamp: stacks-block-height
            })
        
        ;; Update payment counter
        (var-set payment-id-counter new-payment-id)
        
        (ok true)))

;; Withdraw creator earnings
(define-public (withdraw-earnings)
    (let
        (
            (earnings-info (unwrap! (map-get? creator-earnings { creator: tx-sender }) (err ERR-NO-EARNINGS)))
            (earnings-balance (get balance earnings-info))
        )
        ;; Check if there are earnings to withdraw
        (asserts! (> earnings-balance u0) (err ERR-NO-EARNINGS))
        
        ;; Transfer earnings to creator
        (try! (as-contract (stx-transfer? earnings-balance tx-sender tx-sender)))
        
        ;; Reset creator earnings
        (map-set creator-earnings
            { creator: tx-sender }
            { balance: u0 })
        
        (ok earnings-balance)))

;; Get creator earnings balance
(define-read-only (get-creator-earnings (creator principal))
    (default-to u0 (get balance (map-get? creator-earnings { creator: creator }))))

;; Get platform treasury balance
(define-read-only (get-platform-treasury)
    (var-get platform-treasury))

;; Get payment history
(define-read-only (get-payment-info (payment-id uint))
    (map-get? payment-history { payment-id: payment-id }))

;; Admin function to update platform fee
(define-public (set-platform-fee (new-fee-percentage uint))
    (begin
        ;; Check admin authorization
        (asserts! (is-eq tx-sender PLATFORM-ADMIN) (err ERR-NOT-AUTHORIZED))
        
        ;; Validate fee percentage (max 50% = 5000 basis points)
        (asserts! (<= new-fee-percentage u5000) (err ERR-INVALID-INPUT))
        
        ;; Update fee
        (var-set platform-fee-percentage new-fee-percentage)
        
        (ok true)))

;; Admin function to pause/unpause contract
(define-public (set-contract-paused (paused bool))
    (begin
        ;; Check admin authorization
        (asserts! (is-eq tx-sender PLATFORM-ADMIN) (err ERR-NOT-AUTHORIZED))
        
        ;; Update pause state
        (var-set contract-paused paused)
        
        (ok true)))

;; Admin function to withdraw platform treasury
(define-public (withdraw-platform-treasury (amount uint))
    (let
        (
            (treasury-balance (var-get platform-treasury))
        )
        ;; Check admin authorization
        (asserts! (is-eq tx-sender PLATFORM-ADMIN) (err ERR-NOT-AUTHORIZED))
        
        ;; Check sufficient balance
        (asserts! (<= amount treasury-balance) (err ERR-INSUFFICIENT-PAYMENT))
        
        ;; Transfer to treasury address
        (try! (as-contract (stx-transfer? amount tx-sender PLATFORM-TREASURY)))
        
        ;; Update treasury balance
        (var-set platform-treasury (- treasury-balance amount))
        
        (ok true)))

;; Get current platform fee percentage
(define-read-only (get-platform-fee-percentage)
    (var-get platform-fee-percentage))

;; Check if contract is paused
(define-read-only (is-contract-paused)
    (var-get contract-paused))

;; Get payment counter
(define-read-only (get-payment-counter)
    (var-get payment-id-counter))