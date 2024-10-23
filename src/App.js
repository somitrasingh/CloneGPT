import { useState, useEffect }  from 'react'

const App = () => {
  const [message, setMessage] = useState(null)
  const [value, setValue] = useState(null)
  const [previousChats, setPreviousChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState(null)
  const createNewChat = () => {
    setMessage(null)
    setValue("")
    setCurrentTitle(null)
  }

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle)
    setMessage(null)
    setValue("")
  }

  const getMessages = async() => {
    const options = {
      method: 'POST',
      body: JSON.stringify({
        message: value
      }),
      headers: {
        "Content-Type": "application/json"
      }
    }
    try {
      const response = await fetch('http://localhost:8000/completions', options)
      const data = await response.json()
      setMessage(data.choices[0].message)
      setValue("")
    } catch (error) {
      console.log(error)
      
    }
  }
  useEffect(() => {
    console.log(currentTitle, value, message);
    if (!currentTitle && value && message){
      setCurrentTitle(value)
    }
    if (currentTitle && value && message){
      setPreviousChats(previousChats => (
        [...previousChats, 
          {
            title: currentTitle,
            role: "user",
            content: value
          },
          {
            title: currentTitle,
            role: message.role,
            content: message.content
          }
        ]
      ))
    }
  }, [message, currentTitle])
  
  console.log(previousChats)
  const currentChat = previousChats.filter(previousChats => previousChats.title === currentTitle)
  const uniqueTitles = Array.from(new Set(previousChats.map(previousChats => previousChats.title)))
  console.log(uniqueTitles)
  
  return(
    <div className = "app">
      <section className="side-bar">
        <button onClick={createNewChat}> + New Chat </button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => <li key = {index} onClick={() => handleClick(uniqueTitle)}>{uniqueTitle}</li>)}
        </ul>
        <nav>Made by Somitra</nav>
      </section>
      <section className="main">
        {!currentTitle && <h1>CloneGPT</h1>}
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => <li key={index}>
            <p className='role'>{chatMessage.role}</p>
            <p>{chatMessage.content}</p>
          </li>)}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input value = {value} onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && getMessages()}
            placeholder="Type your message here..."/>

            <div id="submit" onClick={getMessages}>➢</div>
          </div>
          <p className="info">
            chatgpt ye chatgpt wo falana dikahana pata nhi.
            kya h ye sala chatgpt, log chutiya bane hue h iske
            peche koi smjho logo ko yrr 
          </p>
        </div>
      </section>
    </div>
  )
}

export default App;
