import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function App() {
    const [query, setQuery] = useState('')
    const [docText, setDocText] = useState('')
    const [results, setResults] = useState([])
    const [documents, setDocuments] = useState([])
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [docCount, setDocCount] = useState(0)

    const fetchState = async () => {
        try {
            const res = await fetch(`${API_URL}/documents`)
            const data = await res.json()
            setDocuments(data.documents)
            setDocCount(data.count)
        } catch (err) {
            console.error("Error fetching state:", err)
        }
    }

    useEffect(() => { fetchState() }, [])

    const handleSearch = async () => {
        try {
            const response = await fetch(`${API_URL}/search`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: query, k: 3})
            })
            const data = await response.json()
            setResults(data.results)
        } catch (error) { console.error("Search failed:", error) }
    }

    const handleAddDocument = async () => {
        try {
            const response = await fetch(`${API_URL}/add`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: docText})
            })
            if (response.ok) {
                setMessage('Document added to Vector DB!')
                setMessageType('success')
                setDocText('')
                fetchState()
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage('Failed to add document')
                setMessageType('error')
            }
        } catch (error) {
            setMessage('Network Error: Is backend running?')
            setMessageType('error')
        }
    }

    const handleDelete = async (id) => {
        try {
            await fetch(`${API_URL}/delete/${id}`, { method: 'DELETE' })
            fetchState()
            setResults(results.filter(item => item.id !== id))
        } catch (error) { console.error("Delete failed", error) }
    }

    const handleClearAll = async () => {
        if(!confirm("Are you sure you want to delete ALL vectors?")) return;
        try {
            await fetch(`${API_URL}/delete-all`, { method: 'DELETE' })
            fetchState()
            setResults([])
            setMessage('Database cleared')
            setMessageType('success')
            setTimeout(() => setMessage(''), 3000)
        } catch (error) { console.error("Clear failed", error) }
    }

    return (
        <div className="container">
            <h1>Vector Search Engine</h1>
            <p className="description">
                This system uses <b>Linear Algebra (Cosine Similarity)</b> to find meaning.
                It converts your text into <b>Vectors</b> and calculates the angle between them.
            </p>

            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>1. Index New Knowledge</h2>
                    <span style={{background: '#334155', padding: '5px 10px', borderRadius: '12px', fontSize: '0.8rem', color: '#94a3b8'}}>
                        Documents: <b>{docCount}</b>
                    </span>
                </div>
                <textarea placeholder="Paste text here..." value={docText} onChange={(e) => setDocText(e.target.value)} />
                <button onClick={handleAddDocument}>Add to Database</button>
                {message && <p style={{color: messageType === 'success' ? '#4ade80' : '#ef4444', marginTop: '10px'}}>{message}</p>}
            </div>

            <div className="card">
                <h2>2. Semantic Search</h2>
                <div className="search-box">
                    <input type="text" placeholder="Ask a question..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    <button onClick={handleSearch}>Search</button>
                </div>
                <div className="results">
                    {results.map((item) =>(
                        <div key={item.id} className="result-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{flex: 1}}>
                                <span className="score">Match: {(item.score * 100).toFixed(1)}%</span>
                                <p>{item.text}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                style={{background: '#ef4444', marginLeft: '10px', padding: '5px 10px', width: 'auto'}}
                                title="Delete this result"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h2>3. Database Content</h2>
                    <button
                        onClick={handleClearAll}
                        style={{background: '#ef4444', fontSize: '0.8rem', padding: '8px 12px'}}
                    >
                        Delete All
                    </button>
                </div>

                <div style={{maxHeight: '300px', overflowY: 'auto', background: '#020617', padding: '10px', borderRadius: '8px', border: '1px solid #334155'}}>
                    {documents.length === 0 && <p style={{color: '#64748b', textAlign: 'center'}}>Database is empty.</p>}

                    {documents.map((doc) => (
                        <div key={doc.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #1e293b',
                            padding: '8px 0'
                        }}>
                            <span style={{color: '#64748b', marginRight: '10px', minWidth: '30px', fontSize: '0.8rem'}}>#{doc.id}</span>
                            <span style={{flex: 1, color: '#cbd5e1', fontSize: '0.9rem'}}>{doc.text}</span>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                style={{background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '4px 8px', marginTop: 0}}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default App