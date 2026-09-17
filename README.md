# Pharmacy Math Lab

A responsive, standalone practice website based on the supplied Pharmacy Technician Math PDF and expanded study guide. No account, package installation, build step, API key, or paid service is required.

## Use it right away

Open `index.html` in a modern browser. Keep all the supplied files in the same folder. Questions, scoring, and reference material work offline. The external FDA reference links need internet access.

## Practice features

- A mixed quiz starts immediately on opening the site.
- Choose metric, household, weight, dose calculations, fractions, or rules and error spotting.
- Choose typed answers, multiple choice, or a mix; conceptual questions use multiple choice.
- Choose 10, 20, or all available questions. A smaller topic uses its full question pool without repeating questions within a session.
- Blank and invalid submissions do not affect the score.
- Check an answer to reveal whether it is correct, the correct answer, the worked calculation, and a memory cue.
- “I'm not sure” reveals the solution and counts the question as missed.
- Answers lock after checking so the score records the first attempt.
- Review all results and retry only missed questions.
- Reference and memory aids remain available without discarding the active session.
- Keyboard-accessible controls, responsive layouts, and screen-reader feedback.

## Scores and privacy

Scores are held only in the current browser tab. Refreshing or closing the page resets the session. Scores do not sync between devices. No personal data, analytics, cookies, or external scripts are used. Opening the site on another device starts a new session.

## Study conventions

The site uses the guide's factors: 1 tsp = 5 mL; 1 tbsp = 15 mL; 1 fl oz ≈ 30 mL; 1 cup ≈ 240 mL; 1 kg ≈ 2.2 lb. Household and weight conversions use these study conventions, not exact physical equivalents. No numeric question requires rounding. Desired and Have must use matching units.

This is a study aid, not clinical decision software. Follow your course, exam, and workplace requirements.

## Edit the site

- `index.html`: page structure and session settings.
- `styles.css`: layout, colors, and responsive design.
- `questions.js`: question bank, study factors, and numeric-answer validation.
- `app.js`: quizzes, scoring, feedback, answer review, and reference content.
- `study-guide.pdf`: the expanded seven-page reference PDF.

Edit these files and commit changes to publish updates through GitHub Pages. No build process is needed.
