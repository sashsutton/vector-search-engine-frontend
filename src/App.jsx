import { useState, useEffect } from 'react'
import './App.css'

function App() {
    const [query, setQuery] = useState('')
    const [docText, setDocText] = useState('')
    const [results, setResults] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [docCount, setDocCount] = useState(0)

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        // Use API_URL instead of hardcoded string
        fetch(`${API_URL}/`)
            .then(res => res.json())
            .then(data => setDocCount(data.docs_count))
            .catch(err => console.error("Backend offline:", err))
    }, [])

    const handleSearch = async () => {
        const response = await fetch('http://127.0.0.1:8000/search', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query: query, k: 3})
        })
        const data = await response.json()
        setResults(data.results)
    }

    const handleAddDocument = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/add', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: docText})
            })
            const data = await response.json()

            if (response.ok) {
                setMessage('Document added to Vector DB!')
                setMessageType('success')
                setDocCount(data.total_docs)
                setDocText('')
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage(`Error: ${data.detail || 'Failed to add'}`)
                setMessageType('error')
            }
        } catch (error) {
            setMessage('Network Error: Is backend running?')
            setMessageType('error')
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>1. Index New Knowledge</h2>
                    <span style={{
                        background: '#334155',
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        fontWeight: 'bold',
                        border: '1px solid #475569'
                    }}>
                        Documents: <span style={{color: '#f8fafc'}}>{docCount}</span>
                    </span>
                </div>

                <textarea
                    placeholder="Paste text here (e.g., 'I aspire to become an Ai engineer...')"
                    value={docText}
                    onChange={(e) => setDocText(e.target.value)}
                />

                <button onClick={handleAddDocument}>Add to Database</button>

                {message && (
                    <p className={messageType === 'success' ? "success" : "error-msg"} style={{
                        color: messageType === 'success' ? '#4ade80' : '#ef4444',
                        fontWeight: 'bold',
                        marginTop: '1rem'
                    }}>
                        {message}
                    </p>
                )}
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