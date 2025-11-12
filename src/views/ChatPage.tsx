import { useConversation } from '@elevenlabs/react'
import { useState, useCallback, useEffect, useRef } from 'react'

export default function ChatPage() {
    const conversation = useConversation({
        onConnect: () => console.log('Conectado al agente'),
        onDisconnect: () => console.log('Desconectado del agente'),
        onMessage: (message) => console.log('Mensaje recibido:', message),
        onError: (error) => console.error('Error en la conexión:', error)
    })
    
    const [isTalking, setIsTalking] = useState(false)
    const [currentImage, setCurrentImage] = useState('logo.jpg')
    const [currentText, setCurrentText] = useState('')
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
    const [isAutoCapturing, setIsAutoCapturing] = useState(false)
    const [cameraState, setCameraState] = useState(false)
    
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    useEffect(() => {
        const checkCameraState = async () => {
            try {
                const response = await fetch('https://eucerin-production.up.railway.app/api/camara/', {
                    method: 'GET'
                })
                const data = await response.json()
                
                if (data.camera && !cameraState) {
                    setCameraState(true)
                    await initiateAutoCapture()
                } else if (!data.camera && cameraState) {
                    setCameraState(false)
                }
            } catch (err) {
                console.error('Error al verificar estado de cámara:', err)
            }
        }

        const interval = setInterval(checkCameraState, 1000)
        return () => clearInterval(interval)
    }, [cameraState])

    const deleteAIResult = async () => {
        try {
            const response = await fetch('https://eucerin-production.up.railway.app/api/ai/delete', {
                method: 'DELETE'
            })
            if (!response.ok) {
                console.warn('No se pudo limpiar el resultado anterior:', response.status)
            }
            console.log('Resultado de AI limpiado')
        } catch (err) {
            console.error('Error al limpiar resultado de AI:', err)
        }
    }

    const initiateAutoCapture = async () => {
        setIsAutoCapturing(true)
        setShowPhotoModal(true)
        setCapturedPhoto(null)
        setCurrentText('') 
        
        await deleteAIResult()
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
            await new Promise((resolve) => {
                const handleCanPlay = () => {
                    if (videoRef.current) {
                        videoRef.current.removeEventListener('canplay', handleCanPlay)
                    }
                    resolve(null)
                }
                
                if (videoRef.current) {
                    if (videoRef.current.readyState >= 2) {
                        resolve(null)
                    } else {
                        videoRef.current.addEventListener('canplay', handleCanPlay)
                        setTimeout(() => resolve(null), 5000)
                    }
                }
            })
            startAutoCountdown()
        } catch (err) {
            console.error('Error al acceder a la cámara:', err)
            closePhotoModal()
            setIsAutoCapturing(false)
        }
    }

    const startAutoCountdown = () => {
        setCountdown(3)
        let count = 3

        const interval = setInterval(() => {
            count -= 1
            setCountdown(count)

            if (count === 0) {
                clearInterval(interval)
                setTimeout(() => {
                    takePhotoAuto()
                    setCountdown(null)
                }, 100)
            }
        }, 1000)
    }

    const takePhotoAuto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context && videoRef.current.videoWidth > 0) {
                canvasRef.current.width = videoRef.current.videoWidth
                canvasRef.current.height = videoRef.current.videoHeight
                context.drawImage(videoRef.current, 0, 0)
                const photo = canvasRef.current.toDataURL('image/jpeg', 0.95)
                setCapturedPhoto(photo)
                console.log('Foto capturada automáticamente:', photo.substring(0, 50) + '...')
                
                setTimeout(() => {
                    sendPhotoToAI(photo)
                }, 500)
            } else {
                console.error('Video no está listo. videoWidth:', videoRef.current?.videoWidth)
            }
        }
    }

    const sendPhotoToAI = async (photoData: string) => {
        try {
            const arr = photoData.split(',')
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
            const bstr = atob(arr[1])
            const n = bstr.length
            const u8arr = new Uint8Array(n)
            
            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i)
            }
            
            const blob = new Blob([u8arr], { type: mime })
            console.log('Blob creado correctamente:', blob.size, 'bytes', 'tipo:', mime)
            
            if (blob.size === 0) {
                throw new Error('El blob está vacío')
            }
            
            const formData = new FormData()
            formData.append('file', blob, 'photo.jpg')

            console.log('Enviando foto al servidor...')
            
            const uploadResponse = await fetch('https://eucerin-production.up.railway.app/api/ai/', {
                method: 'PUT',
                body: formData
            })

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text()
                throw new Error(`Error del servidor: ${uploadResponse.status} - ${errorText}`)
            }

            const data = await uploadResponse.json()
            console.log('Respuesta de AI:', data)
            if (data.result) {
                setCurrentText("")
            }
            const resetResponse = await fetch('https://eucerin-production.up.railway.app/api/camara/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ camera: false })
            })

            console.log('Cámara reseteada:', resetResponse.ok)

            closePhotoModal()
            setIsAutoCapturing(false)
        } catch (err) {
            console.error('Error al enviar foto a AI:', err)
            closePhotoModal()
            setIsAutoCapturing(false)
        }
    }

    useEffect(() => {
        const connectWebSocket = () => {
            try {
                const ws = new WebSocket('wss://eucerin.aosinternational.us')
                
                ws.onopen = () => {
                    console.log('Conectado al servidor WebSocket')
                    wsRef.current = ws
                }

                ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        
                        if (data.image) {
                            console.log('Imagen recibida:', data.image)
                            setCurrentImage(data.image)
                        }
                        
                        if (data.text) {
                            console.log('Texto recibido:', data.text)
                            setCurrentText(data.text)
                        }
                    } catch (err) {
                        console.error('Error al parsear mensaje WebSocket:', err)
                    }
                }

                ws.onerror = (error) => {
                    console.error('Error en WebSocket:', error)
                }

                ws.onclose = () => {
                    console.log('WebSocket cerrado')
                    wsRef.current = null
                    setTimeout(connectWebSocket, 3000)
                }
            } catch (err) {
                console.error('Error al conectar WebSocket:', err)
            }
        }

        connectWebSocket()

        const pingInterval = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'ping' }))
            }
        }, 30000)

        return () => {
            clearInterval(pingInterval)
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [])

    const startCall = useCallback(async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true })
            await conversation.startSession({
                agentId: 'agent_2201k9w3h811ecrspw41g6zh8998',
                connectionType: 'webrtc',
            })
            setIsTalking(true)
        } catch (err) {
            console.error('Fallo al iniciar la llamada:', err)
        }
    }, [conversation])

    const endCall = useCallback(async () => {
        try {
            await conversation.endSession()
        } catch (err) {
            console.error('Fallo al terminar la llamada:', err)
        } finally {
            setIsTalking(false)
            setCurrentImage('logo.jpg')
            setCurrentText('')
            try {
                await fetch('https://eucerin-production.up.railway.app/api/camara/', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ camera: false })
                })
                console.log('Cámara reseteada al terminar llamada')
            } catch (err) {
                console.error('Error al resetear cámara:', err)
            }
        }
    }, [conversation])

    const handleToggle = () => {
        if (isTalking) {
            endCall()
        } else {
            startCall()
        }
    }

    const openPhotoModal = async () => {
        setShowPhotoModal(true)
        setCapturedPhoto(null)
        setCurrentText('')
        await deleteAIResult()
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' } 
            })
            streamRef.current = stream
            if (videoRef.current) {
                videoRef.current.srcObject = stream
            }
        } catch (err) {
            console.error('Error al acceder a la cámara:', err)
        }
    }

    const closePhotoModal = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            streamRef.current = null
        }
        setShowPhotoModal(false)
        setCapturedPhoto(null)
        setCountdown(null)
    }

    const startCountdown = () => {
        setCountdown(3)
        let count = 3

        const interval = setInterval(() => {
            count -= 1
            setCountdown(count)

            if (count === 0) {
                clearInterval(interval)
                setTimeout(() => {
                    takePhoto()
                    setCountdown(null)
                }, 100)
            }
        }, 1000)
    }

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth
                canvasRef.current.height = videoRef.current.videoHeight
                context.drawImage(videoRef.current, 0, 0)
                const photo = canvasRef.current.toDataURL('image/jpeg')
                setCapturedPhoto(photo)
                console.log('Foto capturada:', photo)
            }
        }
    }

    const retakePhoto = () => {
        setCapturedPhoto(null)
        setCountdown(null)
    }

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#F8FAFC] to-[#E8F0F7] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
                    <div className="rounded-xl overflow-hidden shadow-md">
                        <img 
                            src={`./${currentImage}`} 
                            alt="Producto Eucerin" 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-[#273445]">
                        Asesor Eucerin
                    </h2>
                    {currentText && (
                        <p className="text-center text-[#202634] font-medium text-sm leading-relaxed max-w-xs">
                            {currentText}
                        </p>
                    )}
                    <p className="text-center text-[#36475E] text-sm font-medium">
                        {isTalking ? 'Hablando con el asistente...' : 'Presiona el micrófono para comenzar'}
                    </p>
                    <button
                        onClick={handleToggle}
                        className={`p-6 rounded-full transition-all duration-200 text-white active:scale-90 shadow-lg cursor-pointer ${
                            isTalking
                                ? 'bg-[#A82342] hover:bg-[#8a1c34]'
                                : 'bg-[#36475E] hover:bg-[#2a3747]'
                        }`}
                    >
                        {isTalking ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 3.75 18 6m0 0 2.25 2.25M18 6l2.25-2.25M18 6l-2.25 2.25m1.5 13.5c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
                                />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-8 h-8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                                />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={openPhotoModal}
                        className="w-full py-2 px-4 bg-[#A82342] hover:bg-[#8a1c34] text-white rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                        Tomar Foto (Prueba)
                    </button>
                </div>
            </div>

            {showPhotoModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="bg-[#36475E] text-white p-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold">
                                {isAutoCapturing ? 'Captura Automática' : 'Captura tu Foto'}
                            </h3>
                            {!isAutoCapturing && (
                                <button
                                    onClick={closePhotoModal}
                                    className="text-white hover:opacity-80 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="p-6 flex flex-col items-center gap-4">
                            {!capturedPhoto ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full rounded-lg bg-black"
                                    />
                                    
                                    {countdown !== null ? (
                                        <div className="text-6xl font-bold text-[#A82342] animate-pulse">
                                            {countdown === 0 ? '¡Foto!' : countdown}
                                        </div>
                                    ) : !isAutoCapturing && (
                                        <button
                                            onClick={startCountdown}
                                            className="w-full py-3 px-4 bg-[#A82342] hover:bg-[#8a1c34] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.141.175a2.307 2.307 0 0 0-2.429 2.428c-.063.384-.12.761-.175 1.141a2.31 2.31 0 0 0 1.055 2.227m19.5 0a2.31 2.31 0 0 0 1.055-2.227c-.063-.38-.12-.757-.175-1.141a2.307 2.307 0 0 0-2.429-2.428 28.697 28.697 0 0 0-1.141-.175 2.31 2.31 0 0 1-1.641-1.055m0 0a2.3 2.3 0 0 0-2.343-2.343 2.3 2.3 0 0 0-2.343 2.343m0 0c0 1.268.511 2.416 1.343 3.248m0 0a2.31 2.31 0 0 0 2.343 2.343 2.3 2.3 0 0 0 2.343-2.343m-18-8.172a2.31 2.31 0 0 0-1.055 2.227c.063.38.12.757.175 1.141a2.307 2.307 0 0 0 2.429 2.428c.386.063.761.12 1.141.175a2.31 2.31 0 0 0 1.641 1.055m0 0a2.3 2.3 0 1 0 2.343 2.343 2.3 2.3 0 0 0-2.343-2.343Zm10.066 0a2.31 2.31 0 1 1 2.343 2.343 2.3 2.3 0 0 1-2.343-2.343Z" />
                                            </svg>
                                            Disparar (3, 2, 1)
                                        </button>
                                    )}
                                </>
                            ) : !isAutoCapturing && (
                                <>
                                    <img
                                        src={capturedPhoto}
                                        alt="Foto capturada"
                                        className="w-full rounded-lg"
                                    />
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={retakePhoto}
                                            className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition-colors duration-200"
                                        >
                                            Retomar
                                        </button>
                                        <button
                                            onClick={() => {
                                                console.log('Foto enviada:', capturedPhoto)
                                                sendPhotoToAI(capturedPhoto)
                                            }}
                                            className="flex-1 py-2 px-4 bg-[#A82342] hover:bg-[#8a1c34] text-white rounded-lg font-semibold transition-colors duration-200"
                                        >
                                            Enviar Foto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
        </div>
    )
}