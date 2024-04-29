import { useState } from 'react'
import Image from 'next/image'

export default function HowToPlay({ onClose }) {
	const [currentStep, setCurrentStep] = useState(0)

	return (
		<>
			<div className="absolute top-0 left-0 w-full h-full bg-slate-500 sm:bg-black opacity-50" onClick={onClose}></div>
			<div className="absolute top-0 w-full h-full sm:top-16 sm:w-[400px] sm:h-auto bg-slate-500 pt-10 pb-10 flex items-center flex-col rounded">
				<button className="w-12 top-4 right-4 cursor-pointer absolute hover:opacity-50" onClick={onClose}>
					<Image src="close.svg" alt="close" width={48} height={48}></Image>
				</button>
				<div className="text-white text-3xl">How to play</div>
				<div className="text-white text-xl pb-5 text-center">Connect 4 pieces in any direction to win</div>
				<div className="flex items-center justify-center">
					<button
						className={`w-12 hidden shrink-0 sm:block mr-5 rotate-180 ${
							currentStep === 0 ? 'opacity-0 hover:opacity-0 cursor-default' : 'cursor-pointer hover:opacity-50'
						}`}
						disabled={currentStep === 0}
						onClick={() => setCurrentStep(currentStep - 1)}
					>
						<Image src="arrow.svg" alt="arrow" width={48} height={48}></Image>
					</button>
					{[0, 1, 2, 3, 4].map((index) => (
						<img
							src={`${index}.png`}
							alt="board-image"
							className={`w-[200px] sm:w-[230px] ${currentStep === index ? '' : 'hidden'}`}
							key={`tutorial-${index}`}
						/>
					))}
					<button
						className={`w-12 hidden shrink-0 sm:block ml-5 ${
							currentStep === 4 ? 'opacity-0 hover:opacity-0 cursor-default' : 'cursor-pointer hover:opacity-50'
						}`}
						disabled={currentStep === 4}
						onClick={() => setCurrentStep(currentStep + 1)}
					>
						<Image src="arrow.svg" alt="arrow" width={48} height={48}></Image>
					</button>
				</div>
				<div className="flex sm:hidden pt-5">
					<button
						className={`w-12 mr-5 rotate-180 ${
							currentStep === 0 ? 'opacity-0 cursor-default' : 'cursor-pointer hover:opacity-50 '
						}`}
						disabled={currentStep === 0}
						onClick={() => setCurrentStep(currentStep - 1)}
					>
						<Image src="arrow.svg" alt="arrow" width={48} height={48}></Image>
					</button>

					<button
						className={`w-12 ml-5 ${
							currentStep === 4 ? 'opacity-0 cursor-default' : 'cursor-pointer hover:opacity-50 '
						}`}
						disabled={currentStep === 4}
						onClick={() => setCurrentStep(currentStep + 1)}
					>
						<Image src="arrow.svg" alt="arrow" width={48} height={48}></Image>
					</button>
				</div>
			</div>
		</>
	)
}
