;; quantum-time-token

(define-fungible-token quantum-time-unit)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-token-owner (err u101))

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) err-not-token-owner)
    (ft-transfer? quantum-time-unit amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? quantum-time-unit amount recipient)
  )
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance quantum-time-unit who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply quantum-time-unit))
)
