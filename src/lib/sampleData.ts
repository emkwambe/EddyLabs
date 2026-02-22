/**
 * Sample test data for Fairlytica
 * Use these examples to test the analysis system
 */

export const SAMPLE_INVOICE = `
INVOICE #12345
Date: November 15, 2024

ABC Medical Center
123 Healthcare Drive
Anytown, USA 12345

Bill To:
John Smith
456 Patient Street
Somewhere, USA 67890

Description                          Amount
------------------------------------------
Office Visit                        $150.00
Lab Work - Blood Panel              $275.00
X-Ray Imaging                       $450.00
Facility Fee                        $125.00
Medical Supplies                     $45.00
Processing Fee                       $35.00
Administrative Fee                   $25.00
------------------------------------------
Subtotal                          $1,105.00
Tax                                  $0.00
------------------------------------------
TOTAL DUE                         $1,105.00

Payment Terms: Due within 30 days
Late Fee: 1.5% per month on unpaid balance

Questions? Call 555-123-4567
`

export const SAMPLE_DENTAL_ESTIMATE = `
DENTAL TREATMENT ESTIMATE

Patient: Jane Doe
Date: November 10, 2024

Smile Perfect Dentistry
Dr. Thomas White, DDS

Recommended Treatment Plan:

Procedure                           Cost
------------------------------------------
Exam & X-Rays (D0150, D0210)       $185.00
Teeth Cleaning (D1110)              $125.00
Crown - Porcelain/Ceramic (D2740) $1,450.00
Root Canal - Molar (D3330)        $1,200.00
Core Buildup (D2950)                $350.00
Temporary Crown (D2799)             $150.00
Infection Control Fee                $45.00
Sterilization Fee                    $35.00
PPE Fee                              $25.00
------------------------------------------
Total Estimate                    $3,565.00

Insurance Estimate: $1,200.00
Your Estimated Portion: $2,365.00

This estimate is valid for 90 days.
Prices subject to change without notice.

Payment Options:
- Pay in full: 5% discount
- Financing available: 0% APR for 6 months,
  then 24.99% APR on remaining balance
`

export const SAMPLE_AUTO_ESTIMATE = `
AUTO REPAIR ESTIMATE

Customer: Mike Johnson
Vehicle: 2019 Honda Accord
Mileage: 67,234
Date: November 12, 2024

Quick Fix Auto Repair
Service Advisor: Steve

REPAIRS NEEDED:

Part/Labor                    Qty    Total
------------------------------------------
Brake Pads - Front            1    $89.95
Brake Pads - Rear             1    $89.95
Brake Rotors - Front          2   $245.00
Brake Labor                   2   $180.00
Diagnostic Fee                1    $89.95
Oil Change                    1    $79.95
Shop Supplies Fee             1    $35.00
Environmental Disposal Fee    1    $15.00
Hazardous Waste Fee           1    $12.50
------------------------------------------
Parts Total                        $424.90
Labor Total                        $369.90
Fees                               $62.50
------------------------------------------
ESTIMATE TOTAL                     $857.30

Notes: Additional repairs may be needed
once we begin work. Will call for approval.

This estimate valid for 7 days.
`

export const SAMPLE_SUBSCRIPTION_CONTRACT = `
SERVICE AGREEMENT

PREMIUM STREAMING PLUS
Terms and Conditions

Subscriber: Robert Williams
Start Date: November 1, 2024
Plan: Premium Annual

1. SUBSCRIPTION TERMS

Monthly Rate: $14.99/month
Annual Rate: $149.99/year (billed annually)

This subscription will automatically renew at the
end of each billing period unless cancelled.

2. AUTO-RENEWAL

Your subscription will automatically renew at the
then-current rate. You may be notified of rate
changes via email at the address on file.

3. CANCELLATION

Early cancellation fee: $49.99 if cancelled
within the first 6 months of annual subscription.

To cancel, you must call our customer service
line during business hours (9am-5pm EST, M-F).
Online cancellation is not available.

4. PRICE CHANGES

We reserve the right to modify pricing at any
time. Promotional rates are subject to change
without notice after the promotional period.

Current promotional rate: $9.99/month for first
3 months, then regular rate of $14.99/month.

5. DISPUTE RESOLUTION

Any disputes shall be resolved through binding
arbitration. You waive your right to participate
in any class action lawsuit.

6. LIABILITY

We are not responsible for service interruptions
and may modify or discontinue services at our
discretion without notice.

By subscribing, you agree to all terms above.
`

export const SAMPLE_LOAN_AGREEMENT = `
PERSONAL LOAN AGREEMENT

Loan Number: PLN-2024-78945
Date: November 8, 2024

LENDER: QuickCash Financial Services
BORROWER: Sarah Martinez

LOAN TERMS:

Principal Amount: $5,000.00
Annual Percentage Rate (APR): 28.99%
Loan Term: 36 months
Monthly Payment: $201.45

Total of Payments: $7,252.20
Total Interest Charge: $2,252.20

PAYMENT SCHEDULE:

First Payment Due: December 8, 2024
Payment Due Date: 8th of each month

FEES:

Origination Fee: $250.00 (deducted from loan)
Late Payment Fee: $35.00 (if payment 5+ days late)
Returned Payment Fee: $30.00
Prepayment Penalty: 2% of remaining balance if
  paid off within first 12 months

IMPORTANT DISCLOSURES:

Variable Rate Notice: After 12 months, rate may
increase up to 5% based on market conditions.

Default: Failure to pay may result in collection
actions, credit reporting, and legal action.

This is a legally binding agreement. Review
all terms carefully before signing.

Borrower Signature: ________________
Date: ________________
`

export const SAMPLE_DOCUMENTS = {
  invoice: SAMPLE_INVOICE,
  dental: SAMPLE_DENTAL_ESTIMATE,
  auto: SAMPLE_AUTO_ESTIMATE,
  subscription: SAMPLE_SUBSCRIPTION_CONTRACT,
  loan: SAMPLE_LOAN_AGREEMENT,
}

/**
 * Get a sample document by type
 */
export function getSampleDocument(
  type: 'invoice' | 'dental' | 'auto' | 'subscription' | 'loan'
): string {
  return SAMPLE_DOCUMENTS[type]
}
