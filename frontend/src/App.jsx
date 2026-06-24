import { useState, useRef, useEffect } from "react"
import axios from "axios"
import penguin from "./assets/penguin.png"

function WelcomePage({ onStart }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#13111e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background glow */}
      <div style={{
        position: "absolute",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(83,74,183,0.15) 0%, transparent 70%)",
        top: "-100px", left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none"
      }}/>

      {/* Penguin card */}
      <div style={{ position: "relative", marginBottom: "2rem" }}>

        {/* Glow ring */}
        <div style={{
          position: "absolute",
          inset: "-8px",
          borderRadius: "50%",
          background: "conic-gradient(from 0deg, #534AB7, #7B6FD4, #A89FE8, #534AB7)",
          opacity: 0.25,
          filter: "blur(10px)",
        }}/>

        {/* Circle frame */}
        <div style={{
          width: "260px",
          height: "260px",
          borderRadius: "50%",
          background: "linear-gradient(145deg, #5B7FE8 0%, #4A6BD4 60%, #3A55B8 100%)",
          border: "1.5px solid rgba(83,74,183,0.5)",
          boxShadow: "0 0 50px rgba(83,74,183,0.25), 0 0 100px rgba(83,74,183,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* YOUR penguin image — fills circle */}
          <img
            src={penguin}
            alt="Reading penguin"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))",
              position: "relative",
              zIndex: 2
            }}
          />
        </div>

        {/* Floating mini icons */}
        {[
          { top: "10px", left: "-18px", icon: "📄" },
          { top: "10px", right: "-18px", icon: "🔍" },
          { bottom: "30px", left: "-18px", icon: "✨" },
          { bottom: "30px", right: "-18px", icon: "💬" },
        ].map((item, i) => (
          <div key={i} style={{
            position: "absolute",
            ...item,
            width: "32px", height: "32px",
            background: "#1e1a30",
            border: "0.5px solid rgba(83,74,183,0.4)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            fontSize: "14px"
          }}>{item.icon}</div>
        ))}
      </div>

      {/* Badge */}
      <div style={{
        background: "rgba(83,74,183,0.15)",
        border: "0.5px solid rgba(83,74,183,0.4)",
        borderRadius: "20px",
        padding: "4px 14px",
        fontSize: "11px",
        color: "#AFA9EC",
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        marginBottom: "12px"
      }}>AI Document Assistant</div>

      <h1 style={{
        fontSize: "26px",
        fontWeight: 600,
        color: "#EEEDFE",
        marginBottom: "8px",
        letterSpacing: "-0.3px"
      }}>RAG Document Chat</h1>

      <p style={{
        fontSize: "14px",
        color: "#7F77DD",
        textAlign: "center",
        maxWidth: "280px",
        lineHeight: 1.6,
        marginBottom: "1.8rem"
      }}>
        Upload any PDF and ask questions. Get intelligent answers with exact page citations.
      </p>

      <button
        onClick={onStart}
        style={{
          background: "linear-gradient(135deg, #534AB7 0%, #6B62CC 100%)",
          color: "#EEEDFE",
          border: "none",
          borderRadius: "12px",
          padding: "14px 52px",
          fontSize: "15px",
          fontWeight: 500,
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(83,74,183,0.4)",
        }}
      >
        Get Started →
      </button>

      <p style={{ fontSize: "12px", color: "#3C3489", marginTop: "12px" }}>
        No signup needed · Completely free · Runs locally
      </p>
    </div>
  )
}

function ChatPage() {
  const [sessions, setSessions] = useState([
    { id: 1, title: "New Chat", messages: [] }
  ])
  const [activeId, setActiveId] = useState(1)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [pdfLoaded, setPdfLoaded] = useState(false)
  const [pdfName, setPdfName] = useState("")
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  const activeSession = sessions.find(s => s.id === activeId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [sessions, activeId])

  const newChat = () => {
    const id = Date.now()
    setSessions(prev => [...prev, { id, title: "New Chat", messages: [] }])
    setActiveId(id)
    setPdfLoaded(false)
    setPdfName("")
  }

  const updateMessages = (msgs) => {
    setSessions(prev => prev.map(s =>
      s.id === activeId ? { ...s, messages: msgs } : s
    ))
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingPdf(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      await axios.post("http://localhost:8000/upload", formData)
      setPdfLoaded(true)
      setPdfName(file.name)
      const title = file.name.replace(".pdf", "").slice(0, 22)
      setSessions(prev => prev.map(s =>
        s.id === activeId ? {
          ...s,
          title,
          messages: [{
            role: "assistant",
            text: `✅ **${file.name}** loaded! Ask me anything about it.`,
            sources: []
          }]
        } : s
      ))
    } catch {
      alert("Upload failed. Is the backend running?")
    } finally {
      setUploadingPdf(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const currentMsgs = activeSession.messages
    const userMsg = { role: "user", text: input }
    const newMsgs = [...currentMsgs, userMsg]
    updateMessages(newMsgs)
    setInput("")
    setLoading(true)
    try {
      const { data } = await axios.post("http://localhost:8000/chat", { query: input })
      updateMessages([...newMsgs, {
        role: "assistant",
        text: data.answer,
        sources: data.sources
      }])
    } catch {
      updateMessages([...newMsgs, {
        role: "assistant",
        text: "Something went wrong. Please try again.",
        sources: []
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#13111e",
      fontFamily: "sans-serif",
      color: "#EEEDFE"
    }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: "260px",
        background: "#0e0c1a",
        borderRight: "0.5px solid #2a2540",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>

        {/* Logo — AI Document Assistant */}
        <div style={{
          padding: "16px",
          borderBottom: "0.5px solid #2a2540",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <div style={{
            width: "30px", height: "30px",
            background: "linear-gradient(135deg, #534AB7, #6B62CC)",
            borderRadius: "8px",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            fontSize: "15px",
            boxShadow: "0 2px 8px rgba(83,74,183,0.4)"
          }}>📚</div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#EEEDFE" }}>
              AI Document
            </div>
            <div style={{ fontSize: "11px", color: "#7F77DD" }}>
              Assistant
            </div>
          </div>
        </div>

        {/* New Chat button */}
        <button
          onClick={newChat}
          style={{
            margin: "12px",
            background: "#2a2540",
            border: "0.5px solid #3C3489",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#EEEDFE",
            fontSize: "13px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            textAlign: "left"
          }}>
          ＋ New Chat
        </button>

        {/* History label */}
        <div style={{
          fontSize: "10px",
          color: "#534AB7",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
          padding: "4px 16px 6px",
          fontWeight: 500
        }}>Recent Chats</div>

        {/* Sessions list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {[...sessions].reverse().map(s => (
            <div
              key={s.id}
              onClick={() => setActiveId(s.id)}
              style={{
                padding: "10px 14px",
                margin: "2px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                background: s.id === activeId ? "#2a2540" : "transparent",
                border: s.id === activeId
                  ? "0.5px solid #3C3489"
                  : "0.5px solid transparent",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
              <span style={{ fontSize: "13px", flexShrink: 0 }}>💬</span>
              <span style={{
                fontSize: "13px",
                color: s.id === activeId ? "#EEEDFE" : "#7F77DD",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>{s.title}</span>
            </div>
          ))}
        </div>

        {/* Bottom — PDF Upload like Claude */}
        <div style={{
          borderTop: "0.5px solid #2a2540",
          padding: "12px"
        }}>
          <div style={{
            fontSize: "10px",
            color: "#534AB7",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontWeight: 500,
            marginBottom: "8px",
            paddingLeft: "4px"
          }}>Documents</div>

          {/* Uploaded PDF display */}
          {pdfLoaded && (
            <div style={{
              background: "#1e1a2e",
              border: "0.5px solid #3C3489",
              borderRadius: "8px",
              padding: "8px 10px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "16px" }}>📄</span>
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  fontSize: "12px",
                  color: "#EEEDFE",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>{pdfName}</div>
                <div style={{ fontSize: "10px", color: "#4CD9A0" }}>✓ Ready</div>
              </div>
            </div>
          )}

          {/* Upload button */}
          <label style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#2a2540",
            border: "0.5px dashed #534AB7",
            borderRadius: "8px",
            padding: "10px 12px",
            cursor: "pointer",
            color: "#AFA9EC",
            fontSize: "13px",
            transition: "all 0.2s"
          }}>
            <span style={{ fontSize: "16px" }}>
              {uploadingPdf ? "⏳" : "＋"}
            </span>
            {uploadingPdf ? "Processing..." : "Upload PDF"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>

          {/* User footer */}
          <div style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "0.5px solid #2a2540",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <div style={{
              width: "28px", height: "28px",
              background: "linear-gradient(135deg, #534AB7, #6B62CC)",
              borderRadius: "50%",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              fontSize: "12px", fontWeight: 600,
              flexShrink: 0
            }}>A</div>
            <div>
              <div style={{ fontSize: "13px", color: "#EEEDFE" }}>Amitha</div>
              <div style={{ fontSize: "11px", color: "#534AB7" }}>Free plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{
          background: "#1a1628",
          borderBottom: "0.5px solid #2a2540",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "15px", fontWeight: 500, color: "#EEEDFE" }}>
              {activeSession?.title || "New Chat"}
            </span>
            {pdfLoaded && (
              <span style={{
                background: "rgba(76,217,160,0.1)",
                border: "0.5px solid rgba(76,217,160,0.3)",
                borderRadius: "4px",
                padding: "2px 8px",
                fontSize: "11px",
                color: "#4CD9A0"
              }}>● Active</span>
            )}
          </div>
          <div style={{ fontSize: "12px", color: "#534AB7" }}>
            RAG · FAISS · Ollama
          </div>
        </div>

        {/* Messages — ChatGPT style */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "32px 0"
        }}>
          {activeSession?.messages.length === 0 && (
            <div style={{
              textAlign: "center",
              marginTop: "80px"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>📚</div>
              <p style={{ fontSize: "18px", color: "#EEEDFE", marginBottom: "8px", fontWeight: 500 }}>
                What would you like to know?
              </p>
              <p style={{ fontSize: "13px", color: "#534AB7" }}>
                Upload a PDF from the sidebar and start asking questions
              </p>
            </div>
          )}

          {activeSession?.messages.map((msg, i) => (
            <div key={i} style={{
              maxWidth: "720px",
              margin: "0 auto 32px",
              padding: "0 32px"
            }}>
              {/* Role label */}
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: msg.role === "user" ? "#7B6FD4" : "#AFA9EC",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}>
                {msg.role === "user" ? "🧑 You" : "✨ Assistant"}
              </div>

              {/* Message text */}
              <div style={{
                fontSize: "15px",
                color: "#EEEDFE",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap"
              }}>
                {msg.text}
              </div>

              {/* Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div style={{
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "0.5px solid #2a2540"
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: "#534AB7",
                    textTransform: "uppercase",
                    letterSpacing: "0.6px",
                    fontWeight: 500,
                    marginBottom: "10px"
                  }}>Sources</div>
                  {msg.sources.map((src, j) => (
                    <div key={j} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "6px 0",
                      borderBottom: j < msg.sources.length - 1
                        ? "0.5px solid #1e1a2e" : "none"
                    }}>
                      <span style={{
                        width: "20px", height: "20px",
                        background: "#2a2540",
                        border: "0.5px solid #534AB7",
                        borderRadius: "5px",
                        fontSize: "10px",
                        color: "#AFA9EC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        flexShrink: 0
                      }}>{j + 1}</span>
                      <span style={{ fontSize: "13px", color: "#7F77DD" }}>{src}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              maxWidth: "720px",
              margin: "0 auto",
              padding: "0 32px"
            }}>
              <div style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#AFA9EC",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>✨ Assistant</div>
              <div style={{
                fontSize: "14px",
                color: "#534AB7",
                fontStyle: "italic"
              }}>Searching document...</div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div style={{
          background: "#1a1628",
          borderTop: "0.5px solid #2a2540",
          padding: "20px 32px"
        }}>
          <div style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              disabled={!pdfLoaded || loading}
              placeholder={pdfLoaded
                ? "Ask a question about your document..."
                : "Upload a PDF from the sidebar first..."}
              style={{
                flex: 1,
                background: "#13111e",
                border: "0.5px solid #3C3489",
                borderRadius: "12px",
                padding: "14px 18px",
                fontSize: "14px",
                color: "#EEEDFE",
                outline: "none"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!pdfLoaded || loading || !input.trim()}
              style={{
                background: pdfLoaded && input.trim()
                  ? "linear-gradient(135deg, #534AB7, #6B62CC)"
                  : "#2a2540",
                border: "none",
                borderRadius: "12px",
                padding: "14px 22px",
                color: "#EEEDFE",
                fontSize: "14px",
                fontWeight: 500,
                cursor: pdfLoaded && input.trim() ? "pointer" : "not-allowed",
                flexShrink: 0
              }}
            >Send</button>
          </div>
          <div style={{
            maxWidth: "720px",
            margin: "8px auto 0",
            fontSize: "11px",
            color: "#2a2540",
            textAlign: "center"
          }}>
            Powered by LangChain · FAISS · Ollama Llama3.2
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  return started
    ? <ChatPage />
    : <WelcomePage onStart={() => setStarted(true)} />
}