## How to File a Bug Report

1. **Check Existing Issues** – Make sure the bug hasn’t been reported already.
2. **Title** – Give a short, descriptive title.
3. **Description** – Explain what happened vs. what you expected, and steps to reproduce.
4. **Environment** - Add information about OS, browser and version
5. **Attachments** – Add error messages, logs, or screenshots if available.

## How to Suggest a New Feature

1. **Check Existing Issues labelled feature** – See if the feature has already been suggested.
2. **Title** – Use a clear, descriptive title with the appropriate label [FEATURE].
3. **Description** – Explain what the feature does, why it’s useful, and any alteratives that were considered.
4. **Optional Details** – Include mockups, links, or references if helpful.

# Issue Approval Process

For all new issues, a team discussion must occur in which each issue is discussed to check if they are appropriate before it is assigned to someone.

## How to Submit a Pull Request

1. **Push to Your Fork**
   git push origin feature/my-feature
2. **Open a Pull Request**
   Go to the original repo and submit your PR, describing your changes and why they’re useful.

   Use the following format:
   [FEATURE] Implement real-time score updates with Socket.IO
   [FIX] Prevent timer from resetting on page refresh
   [DOCS] Add setup instructions to README
   [REFACTOR] Extract Deezer logic to utility functions
   [STYLE] Format frontend code with Prettier

## How to Set Up Your Environment

**Verify node.js is installed**
You can check by running the following in cmd:
node -v
npm -v

1. **Clone the Repository**  
   git clone <repository-url>
   cd <repository-folder>

2. **Redirect to backend folder**
   cd backend
   follow steps 4 - 5

3. **Redirect to frontend folder**
   cd frontend
   follow steps 4 - 5

4. **Install Dependencies**
   npm install

5. **Run the application**
   npm run dev

## Types of Contributions

We welcome contributions that improve the project, including bug fixes, new features, documentation updates, tests, and performance improvements.

We do not accept contributions that duplicate existing functionality, introduce unstable or untested code, or include unrelated content such as spam or personal projects.

## Getting Started for New Contributors

New contributors can get started by first exploring the project and reading the documentation to understand its structure and goals.

Follow the contribution guidelines, set up your environment, and start with small, manageable changes to gradually become familiar with the project workflow.

## Technical Requirements for Contributions

All contributions should include tests for any new functionality or bug fixes whenever possible.

Ensure your code is clean, well-documented, and passes all existing tests before submitting a pull request.

Include any necessary instructions or notes that help reviewers understand and test your changes.

## Project Roadmap and Vision

The project aims to create an engaging “Guess the Song” application where users can join rooms, listen to a song, and earn points based on how quickly they answer correctly.

Our roadmap includes features such as multiplayer rooms, real-time scoring, leaderboards, and enhanced song selection choices.

## High-Level Design / Architecture

The application follows a client-server architecture.  
Clients connect to the server to join rooms, receive song data, and submit answers in real time. Game logic and scoring is also handled here.  
The server manages user authentication and room states, and ensures synchronization between players.  
The data layer handles user profiles, and leaderboards.  
Communication between clients and server is handled via Socket.io or a similar real-time protocol to provide instant updates and a seamless multiplayer experience.

## Project Ground Rules

Contributors are expected to behave respectfully and professionally when interacting with others in the project.  
Follow the [Code of Conduct](./CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all participants.  
Respect others’ opinions, provide constructive feedback, and avoid disruptive or harmful behavior.
