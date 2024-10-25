import { useState, useEffect, useRef } from 'react';

const App = () => {
  const [message, setMessage] = useState(null);
  const [value, setValue] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);

  // Ref to the feed element to handle scrolling
  const feedRef = useRef(null);
  // Ref to the input field to control focus/blur
  const inputRef = useRef(null);

  useEffect(() => {
    // Detect when the page is refreshed or closed
    window.onbeforeunload = async () => {
      // Send a request to reset conversation history on the server
      await fetch('https://clonegpt-e8i67.ondigitalocean.app/reset', { method: 'POST' });
    };

    // Clean up the effect when component unmounts
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  const createNewChat = () => {
    setMessage(null);
    setValue('');
    setCurrentTitle(null);
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue('');
  };

  const getMessages = async () => {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const response = await fetch('https://clonegpt-e8i67.ondigitalocean.app/completions', options);
      const data = await response.json();
      setMessage(data.choices[0].message);

      // Blur the input field after submitting the message (to close the keyboard)
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      setPreviousChats((previousChats) => [
        ...previousChats,
        {
          title: currentTitle,
          role: 'user',
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message, currentTitle]);

  // Effect to auto-scroll to the bottom whenever previousChats changes
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [previousChats]); // This will trigger every time previousChats updates

  const currentChat = previousChats.filter((previousChats) => previousChats.title === currentTitle);
  const uniqueTitles = Array.from(new Set(previousChats.map((previousChats) => previousChats.title)));

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>Made by CloseAI</nav>
      </section>
      <section className="main">
        {!currentTitle && <h1>CloneGPT</h1>}
        <ul className="feed" ref={feedRef}>
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <p className="role">{chatMessage.role}</p>
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input
              ref={inputRef} // Attach the ref to the input field
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && getMessages()}
              placeholder="Type your message here..."
            />
            <div id="submit" onClick={getMessages}>
              ➢
            </div>
          </div>
          <p className="info">
            Laddu Mutyana Avatara Igina Sanchari Devara Sanchar Madu Ta Bhakt Ramanya Gadkand Madya Raa Avree Laddu
            Mutya Avree Laddu Mutya
          </p>
        </div>
      </section>
    </div>
  );
};

export default App;
