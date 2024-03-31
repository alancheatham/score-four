import { useState } from 'react'

export default function HowToPlay({ onClose }) {
	const [currentStep, setCurrentStep] = useState(0)

	return (
		<>
			<div className="absolute top-0 left-0 w-full h-full bg-black opacity-50" onClick={onClose}></div>
			<div className="absolute top-16 bg-slate-500 p-10 flex items-center flex-col rounded">
				<button className="w-12 top-4 right-4 cursor-pointer absolute hover:opacity-50" onClick={onClose}>
					<img src="close.svg"></img>
				</button>
				<div className="text-white text-3xl">How to play</div>
				<div className="text-white text-xl pb-5">Connect 4 pieces in any direction to win</div>
				<div className="flex align-items-center">
					<button
						className={`w-12 cursor-pointer hover:opacity-50 mr-5 rotate-180 ${
							currentStep === 0 ? 'opacity-50 cursor-default' : ''
						}`}
						disabled={currentStep === 0}
						onClick={() => setCurrentStep(currentStep - 1)}
					>
						<img src="arrow.svg"></img>
					</button>
					<img src={`${currentStep}.png`} alt="board-image" />
					<button
						className={`w-12 cursor-pointer hover:opacity-50 ml-5 ${
							currentStep === 4 ? 'opacity-50 cursor-default' : ''
						}`}
						disabled={currentStep === 4}
						onClick={() => setCurrentStep(currentStep + 1)}
					>
						<img src="arrow.svg"></img>
					</button>
				</div>
			</div>
		</>
	)
}
