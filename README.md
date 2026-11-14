# ✈️ Fact Flight

**Little practice. Big confidence.**

Fact Flight is a free, browser-based math fact fluency application designed to help elementary school students build speed, accuracy, and confidence through interactive practice.

## Features

The v6 development app opens with tile-based Home navigation. Choose Quick Practice for any of the eight math activities, or Math → activity → mode → level → input/view. Five levels remain available for addition, subtraction, multiplication, division, number bonds, doubles, halves, and squares. Letters & Sounds, Colors & Shapes, and Reading are marked Coming Soon and cannot be opened. Profiles are not part of this increment.

Quick Practice offers 5/10/15/20 questions without a timer. Free Practice continues until you choose Finish. Timed Practice uses a selected finite set with a two-minute limit; Test is a 60-question, two-minute preset for the selected activity. The original School Test remains a distinct multiplication preset with tables 2–10, 60 facts, and its original generator and scoring.

Choose Focus or Worksheet before starting. Skip, Undo, Finish, and Home are available during sessions. Home or other navigation asks whether to keep practicing or finish and review results; the clock and microphone continue while deciding. Results include Return Home. Free Practice skips move forward and remain in results for review; finite sessions retain the existing revisit-unresolved behavior.

New activity results save locally alongside the original history in a separate storage key; Progress and full-history exports include both. There is no history migration or profile assignment. Back up before updating if you have existing history. The owner reported successful voice and new-activity testing for the math integration. The owner also reported successful phone use of Focus. Physical-device verification of the new menus and continuous Free Practice remains pending.

- 60-question multiplication fluency quizzes covering factors 1–10
- Two-minute timed tests and untimed practice
- Spoken answers using browser speech recognition or typed answers using a keyboard
- On-screen numeric keypad with an **Enter** key for mobile practice
- Inline answer entry, automatic movement to the next fact, and scrolling to the active question
- Light and dark modes
- First-try accuracy, corrections, skips, and response-time tracking
- Detailed practice history and identification of frequently missed facts
- Responsive layout for desktop and mobile devices
- Local progress storage with JSON and CSV export

## Try Fact Flight

**[Launch Fact Flight](https://nattodd.github.io/FactFlight/)**

No downloads or accounts required. For the best experience, open Fact Flight directly in a browser, not inside a messaging-app preview. Safari and Chrome on iPhone have both been tested for voice practice, with the appropriate permissions enabled.

## Enable voice answers: microphone and speech recognition

Fact Flight uses the browser's speech recognition feature to convert spoken math answers to text. Tap **Start a session**, grant any requested permission, and say **“ready”**. The timer begins after “ready.” If speech recognition stops, tap **Reconnect microphone**, or switch to keyboard input.

### iPhone / iPad — Chrome

Two separate iOS permissions may be required:

1. Open **iPhone Settings → Apps → Chrome** and turn **Microphone** **On**.
2. Open **Settings → Privacy & Security → Speech Recognition** and enable **Chrome**, if listed. Depending on iOS version, Speech Recognition may also be available from Chrome's app settings.
3. Open Fact Flight in Chrome and allow microphone access for the website when requested.
4. Return to Fact Flight and begin a new voice session. If necessary, fully close and reopen Chrome after changing permissions.

**Note:** Microphone permission alone may not be enough. On our iPhone tests, enabling Chrome's separate **Speech Recognition** permission resolved the “Microphone: Disconnected” issue.

### iPhone / iPad — Safari

1. Open Fact Flight in **Safari** and allow microphone/speech recognition access when prompted.
2. If microphone access was previously blocked, open the website's **Page Menu → Website Settings → Microphone** and change it to **Allow** (menu wording varies by iOS version). You can also review **Settings → Apps → Safari → Microphone**.
3. If Safari appears under **Settings → Privacy & Security → Speech Recognition**, enable it.
4. Reload the website and try a new voice session.

Fact Flight also supports being added to the iPhone Home Screen from Safari. Test microphone access after adding it, because Home Screen web apps can have different permission behavior.

### Android — Chrome

1. Open **Android Settings → Apps → Chrome → Permissions → Microphone**. Set the permission to **Allow while using the app** (wording varies by phone and Android version).
2. Open **Chrome → ⋮ → Settings → Site settings → Microphone**. Make sure sites can request microphone access.
3. If `https://nattodd.github.io` is under **Blocked**, open its entry and change the microphone permission to **Allow**.
4. Return to Fact Flight, allow microphone access when prompted, and start a new voice session.

Android generally does **not** have the same separate, system-wide **Speech Recognition** switch used by iOS Chrome. Browser speech recognition availability can still vary by Android version, browser, and installed speech services. If unavailable, use keyboard mode.

### Desktop — Chrome / Edge

1. Open Fact Flight over **HTTPS**.
2. In the browser's **site controls / site settings**, allow **Microphone** for the website.
3. Check that the intended microphone is selected and not muted.
4. Reload the page and start a new voice session.

### If voice answers still do not work

- Confirm that the app says **Microphone: Connected** before answering.
- Tap **Reconnect microphone** if recognition has stopped.
- Speak one number at a time; use keyboard mode in noisy environments.
- Make sure the device or browser is not blocking microphone access.
- Update the browser and try a fresh session. Recognition can depend on browser or operating-system services, even when microphone permission is enabled.

## Privacy

- Fact Flight does not require accounts or upload quiz performance data to a server. Practice results are stored **locally in the browser** on the device where they were recorded.
- Different browsers and devices maintain separate histories; results do not automatically synchronize. Clearing browser data can erase local progress. Use **Progress → Export full history JSON** to keep a backup.
- The app does **not** store microphone audio recordings. It does store recognized text from answer attempts and unrecognized phrases with session results locally; exported histories may include those transcripts.
- Depending on the browser and platform, speech recognition may use an online service to process audio. Review browser privacy settings if this is a concern.

## Planned Enhancements

- Addition, subtraction, and division practice
- Multiple student profiles
- Customizable question counts and difficulty levels
- Expanded progress analytics and personalized review

## Technology

Built with HTML, CSS, and vanilla JavaScript. Hosted for free using GitHub Pages.

## Status

Fact Flight is independently developed with AI-assisted design, implementation, and testing using OpenAI's ChatGPT and Codex.

Actively developed as a personal educational project. Version 5 includes an improved mobile numeric keypad, inline answer entry, voice auto-scrolling, and more resilient spoken-number parsing.
