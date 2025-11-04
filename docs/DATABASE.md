# Database – ER Diagram (Text)

Primary Table: `VolunbaseTable` (DynamoDB)

| PK                        | SK                              | Type         | Attributes                         |
|--------------------------|---------------------------------|--------------|------------------------------------|
| USER#<user_id>           | PROFILE                         | AdminProfile | email, org_name, tier, payment_id  |
| USER#<user_id>           | EVENT#<event_id>                | Event        | eventName, publicSlug, status      |
| EVENT#<event_id>         | SHIFT#<shift_id>                | Shift        | shiftName, startTime, slotsNeeded, slotsFilled |
| EVENT#<event_id>         | REGISTRATION#<registration_id>  | Registration | volunteerName, volunteerEmail, shiftId |
| SLUG#<public_slug>       | EVENT                           | EventSlug    | eventId                            |
| VOLUNTEER#<email>        | PROFILE                         | Volunteer    | name                               |
| SA#CONFIG                | PAYMENT_LOGS                    | PaymentLog   | ...                                |
| SA#KPI                   | DAILY_STATS                     | Kpi          | ...                                |

Tenancy: All keys are prefixed by `tenantId::` via middleware to ensure isolation.

GSI:
- `EVENT_BY_DATE` (PK: `DATE#<date>`, SK: `EVENT#<event_id>`) for anti-cheat locking.
- `AFFILIATE#<affiliate_id>` (SK: `REFERRAL#<referred_user_id>`) for growth tracking.

Migration: See `migrations/` for initial setup.

