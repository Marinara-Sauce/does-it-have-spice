# What is this
Readers come from various audiences and backgrounds, and as such, some may feel uncomfortable when coming across unexpected sexual content (or "smut") while reading. However, researching books prior to purchasing them is tricky due to the potential of coming across plot details or "spoilers" surrounding this content.

"Does it have spice" (or, in a slightly more NSFW name, "Does it have smut") is a website dedicated to informing prospective readers of sexual content in books. This website provides a direct, spoiler-free, non-judgmental "smut level" to books, as well as provides the opportunity for readers to contribute to the database.

Book reports are as generic as possible, using just the title, author, genre, and the "smut level," split into one of four categories. Users can enter the page numbers of certain sections to avoid. This is designed as such to allow readers to research books without any fear of encountering plot details or spoilers.

## Inspiration
The site is inspired by other content-advisory sites such as [doesthedogdie.com](https://www.doesthedogdie.com/).

# Production
The site is hosted at [doesithavesmut.com](https://doesithavesmut.com). After merging a PR to `main` a deployment is kicked off by Github Actions to deploy the changes.

# Technical Details
I developed this website as a way to use AI tools for generating simple web-apps. The bulk of the features were created using [lovable.dev](https://lovable.dev).

## Tech Stack
The front end was created using React and Vite, which was mostly setup through Lovable. The back end is hosted by [Supabase](https://supabase.com).

# Getting Started
## Pre-Reqs

 - NPM and Node.JS (Version 18 Minimum) must be installed

## Installation

Follow these steps to setup the repository:
```sh
# Step 1: Clone the repository
git clone https://github.com/Marinara-Sauce/does-it-have-spice

# Step 2: CD into the directory
cd does-it-have-spice

# Step 3: Run npm install
npm i

# Step 4: Launch the local dev server
npm run dev
```
The dev server will automatically sync to any changes you've made locally.

## Development
This project uses ESLint and Prettier for code quality and standards. ESLint follows the recommended ruleset and will fail at any code-style violations detected by Prettier. Both ESLint and Prettier must pass for a PR to be approved.