// "use client";

// import React from "react";

// function Page() {
//   return (
//     <main>
//       <h1>Contribute a Transcript to the Recording</h1>

//       <form>
//         <label htmlFor="transcript">Transcript:</label>
//         <textarea
//           id="transcript"
//           name="transcript"
//           required
//           className="transcriptionbox"
//           placeholder="Enter your transcript here..."
//           rows={12}
//           cols={75}
//         ></textarea>
//       </form>

//       <button className="transbut">Submit Transcript</button>
//     </main>
//   );
// }

// export default Page;

//Tells Next.js that this is a client component so it can use hooks, event handlers and other client-side features.
"use client";

// Import necessary typescript-only type for the form submission event.
import type { SubmitEvent } from "react";
//import reacts usestate hook so component remembers values like text in the textarea and status message.
import { useState } from "react";

//Returns the JSX describing the webpage/ the webpage itself
export default function Page() {
  // text holds what user typed into text area and setText() is setter function that updates the default "" to the text provided.
  const [text, setText] = useState("");
  // message holds the status message displayed to the user after form submission.
  const [message, setMessage] = useState("");

  // SubmitEvent<HTMLFormElement> represents the kind of event the function expexpects.
  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    //removes whitespace
    const submittedText = text.trim();

    //Checks that theres text to submit
    if (!submittedText) {
      setMessage("Please enter a transcript first.");
      return;
    }

    //Creates javascript object named body that places textboxes text and other required record etails into
    //Structure API expects.
    const body = {
      id: crypto.randomUUID(),
      siteId: "site-001", // Replace with the actual site ID.
      contributorId: "guest-abc", // Temporary example ID.
      text: submittedText,
      language: "en",
      submission: "submitted",
      media: [],
      //Returns date represening string
      createdAt: new Date().toISOString(),
    };

    //Sends the request to the API
    try {
      setMessage("Submitting...");

      const response = await fetch("http://localhost:3001/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

      //Checks if response was recieved
      if (!response.ok) {
        setMessage(`Submission failed (${response.status}): ${responseText}`);
        return;
      }

      //Runs after request succeded.
      //updates status message shown in the page.
      setMessage("Record submitted successfully.");
      setText(""); // Clears the text area after successful submission.
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Could not reach the API: ${error.message}`
          : "Could not reach the API.",
      );
    }
  }

  //Returns the webpage with the form and status message.
  return (
    <main>
      <h1>Contribute a Transcript to the Recording</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="transcript">Transcript:</label>
        <br></br>
        <br></br>
        <textarea
          id="transcript"
          name="transcript"
          className="transcriptionbox"
          placeholder="Enter your transcript here..."
          rows={10}
          cols={75}
          value={text}
          onChange={(event) => setText(event.currentTarget.value)}
          required
        />
        <br></br>
        <br></br>

        <button type="submit">Submit Transcript</button>
      </form>
      {/*Displays the status message if it exists. // The role="status" attribute
      helps screen readers announce the message.*/}
      {message && <p role="status">{message}</p>}
    </main>
  );
}
