import { useState } from 'react'
import './App.css'

function App() {
    const [query, setQuery] = useState('')
    const [docText, setDocText] = useState('')
    const [results, setResults] = useState([])
    const [message, setMessage] = useState('')

    // Function  to search
    const handleSearch = async () => {
        const response = await fetch('http://127.0.0.1:8000/search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query: query, k: 3})
        })
        const data = await response.json()
        setResults(data.results)
    }

    // Function to add a document
    const handleAddDocument = async () => {
        const response = await fetch('http://127.0.0.1:8000/add', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({text: docText})
        })
        if (response.ok) {
            setMessage('Document added to Vector DB!')
            setDocText('')
            setTimeout(() => setMessage(''), 3000)
        }
    }

  return (
        <div className="container">
            <h1>Vector Search Engine</h1>

            <p className="description">
                This system uses <b>Linear Algebra (Cosine Similarity)</b> to find meaning.
                It converts your text into <b>Vectors</b> (lists of numbers) and calculates the angle between them.
            </p>

            <div className="card">

                <h2>1. Index New Knowledge</h2>

                <textarea
                    placeholder="Paste text here (e.g., 'I aspire to become an Ai engineer...')"
                    value={docText}
                    onChange={(e) => setDocText(e.target.value)}
                />

                <buttonn onClick={handleAddDocument}>Add to Database</buttonn>
                {message && <p className="success">{message}</p>}

            </div>

            <div className="card">

                <h2>2. Semantic Search</h2>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>

                <div className="results">
                    {results.map((item, index) =>(
                        <div key={index} className="result-item">
                            <span className="score">Similarity: {(item.score * 100).toFixed(1)}%</span>
                            <p>{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
  )
}

export default App
