import { useRef } from "react"
import { NavLink, useNavigate } from "react-router-dom"

export default function IndexPage() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const navigate = useNavigate()

  const handleScrollToPigmentacion = () => {
    navigate('#pigmentacion')
    setTimeout(() => {
      document.getElementById('pigmentacion')?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(error => console.log("Error al reproducir:", error))
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center mb-5">
        <video
          ref={videoRef}
          className="block w-full max-w-6xl rounded-md shadow-xl mx-auto"
          controls
        >
          <source src="./Eucerin_Video.mp4" />
        </video>
      </div>

      <div className="flex justify-center gap-4 mt-10">
        <NavLink
          className="bg-[#36475E] text-white py-3 px-5 font-semibold text-[15.2px] my-3 mx-0 shadow-xl cursor-pointer transition-transform rounded-full flex gap-2 items-center justify-center hover:opacity-90"
          to="/chat">
          Ir al asesor virtual
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
          </svg>
        </NavLink>
        <button
          onClick={handlePlayVideo}
          className="bg-[#36475E] text-white py-3 px-5 font-semibold text-[15.2px] my-3 mx-0 shadow-xl cursor-pointer transition-transform rounded-full flex gap-2 items-center justify-center hover:opacity-90"
        >
          Hablar con natalia
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
          </svg>
        </button>
      </div>

      <div className="mt-20 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold">Descubre tu <span className="text-[#A82342]">rutina ideal</span></h1>

        <p className="text-lg mt-11 mb-5 mx-6 text-[#202634]">Nuestra asesora virtual te recomendará los productos perfectos para tus necesidades.</p>

        <div className="flex justify-center gap-3 my-4 mx-0">
          <div className="bg-white p-2 rounded-lg shadow-lg">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#A82342" className="size-5">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-center">Personalizado</p>
          </div>
          <div className="bg-white p-2 rounded-lg w-25 shadow-lg">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#A82342" className="size-5">
                <path fillRule="evenodd" d="M8.5 3.528v4.644c0 .729-.29 1.428-.805 1.944l-1.217 1.216a8.75 8.75 0 0 1 3.55.621l.502.201a7.25 7.25 0 0 0 4.178.365l-2.403-2.403a2.75 2.75 0 0 1-.805-1.944V3.528a40.205 40.205 0 0 0-3 0Zm4.5.084.19.015a.75.75 0 1 0 .12-1.495 41.364 41.364 0 0 0-6.62 0 .75.75 0 0 0 .12 1.495L7 3.612v4.56c0 .331-.132.649-.366.883L2.6 13.09c-1.496 1.496-.817 4.15 1.403 4.475C5.961 17.852 7.963 18 10 18s4.039-.148 5.997-.436c2.22-.325 2.9-2.979 1.403-4.475l-4.034-4.034A1.25 1.25 0 0 1 13 8.172v-4.56Z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-center">Cientifico</p>
          </div>
          <div className="bg-white p-2 rounded-lg w-25 shadow-lg">
            <div className="flex justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#A82342" className="size-5">
                <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
              </svg>
            </div>
            <p className="text-sm text-center">Eficaz</p>
          </div>
        </div>

        <button
          onClick={handleScrollToPigmentacion}
          className="bg-[#36475E] text-white py-3 px-5 font-semibold text-[15.2px] my-3 mx-0 shadow-xl cursor-pointer transition-transform rounded-full flex gap-2 items-center justify-center hover:opacity-90"
        >
          Hiperpigmentación en la piel
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mt-60 flex flex-col items-center" id="pigmentacion">
        <h2 className="text-3xl font-semibold my-10">DIFERENTES TIPOS DE HIPERPIGMENTACIÓN</h2>

        <div className="flex flex-wrap gap-8 justify-center">
          <div className="flex flex-col justify-start items-center text-base text-[#202634]">
            <img src="./Efelides.png" alt="Efélides" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
            <p className="mt-3">EFÉLIDES PECAS</p>
          </div>
          <div className="flex flex-col justify-start items-center text-base text-[#202634]">
            <img src="./Lentigos.png" alt="Lentigos" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
            <p className="mt-3">LENTIGOS SOLARES (manchas de la edad)</p>
          </div>
          <div className="flex flex-col justify-start items-center text-base text-[#202634]">
            <img src="./Melasma.jpg" alt="Melasma" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
            <p className="mt-3">MELASMA / CLOASMA</p>
          </div>
          <div className="flex text-center flex-col justify-start items-center text-base text-[#202634]">
            <img src="./Hiperpigmentacion.jpg" alt="Hiperpigmentación" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
            <p className="mt-3">HIPERPIGMENTACIÓN <br /> POST-INFLAMATORIA(PIH)</p>
          </div>
        </div>

        <h3 className="text-xl font-normal my-10">La hiperpigmentación puede ser difusa o localizada según las causas</h3>

        <div className="flex flex-wrap gap-8 justify-center">
          <div className="text-center">
            <img src="./Antipigment1.jpg" alt="Antipigment 1" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
          </div>
          <div className="text-center">
            <img src="./Antipigment2.jpg" alt="Antipigment 2" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
          </div>
          <div className="text-center">
            <img src="./Antipigment3.jpg" alt="Antipigment 3" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
          </div>
          <div className="text-center">
            <img src="./Antipigment4.jpg" alt="Antipigment 4" className="w-[220px] h-[220px] object-cover rounded-xl shadow-lg" />
          </div>
        </div>
      </div>
    </>
  )
}