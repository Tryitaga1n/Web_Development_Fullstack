# Five-Minute Screencast Script

Use a desktop browser at approximately 1440 by 900 pixels. Close unrelated tabs and notifications. Prepare two accounts before recording.

## 0:00-0:20 - Introduction

- Show the Nocturne Vinyl home page.
- Explain: "This is Auctionary, a full-stack auction prototype built with Express, SQLite and Vue 3. I have branded the white-label application as Nocturne Vinyl, a specialist record auction house."

## 0:20-0:50 - Authentication

- Open **Register** and point out the password requirements.
- Open **Log in** and sign in as Maya Turner.
- Point out the account menu, profile link and authenticated navigation.

## 0:50-1:25 - Search and categories

- Open **Browse**.
- Search for `and` and explain the title search.
- Select **Vinyl Records** to demonstrate the multi-category extension.
- Show pagination controls and the responsive card layout.

## 1:25-2:05 - Auction details and bidding

- Open a lot.
- Explain the current bid, seller, deadline, question thread and bid history.
- Log in as Ethan Brooks if needed.
- Place a bid greater than the current bid.
- Show the updated bid, leading bidder and bid-history entry.
- Briefly show that a seller cannot bid on their own item.

## 2:05-2:40 - Questions and answers

- As Ethan, ask a question on Maya's auction.
- Log out and sign in as Maya.
- Return to the item and answer the question.
- Show the published answer.
- Mention that empty fields, extra fields and unauthorised actions are rejected.

## 2:40-3:50 - Create an auction and local drafts

- Open **Sell a record**.
- Enter a title, description, starting bid and future closing date.
- Select multiple categories.
- Click **Save as draft** and show the local-saved confirmation.
- Open **Drafts**, show the draft card, then reopen it for editing.
- Mention that drafts are stored in browser `localStorage` and can be edited or deleted.
- Click **Publish auction** and show the new live listing.

## 3:50-4:25 - Profile and status filters

- Open the account menu and **My profile**.
- Show open listings, active bids and completed auctions.
- Return to **Browse** and demonstrate "My open auctions" or "Auctions I bid on".

## 4:25-4:50 - Extensions

- Point out that item names, descriptions, questions and answers pass through the profanity filter.
- Remind the viewer that categories support multiple associations and search filtering.
- Remind the viewer that drafts provide create, view, edit and delete behaviour.

## 4:50-5:00 - Round-up

- Briefly show the running official test result: `128 passing`.
- Conclude: "The API follows the provided OpenAPI contract, and the Vue frontend exposes the complete user journey with graceful error handling and a consistent responsive brand."
