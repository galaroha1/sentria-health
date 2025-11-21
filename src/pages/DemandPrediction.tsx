import { useState, useRef } from 'react';
import { generatePatientData } from '../ml/dataGenerator';
import { LogisticRegression } from '../ml/LogisticRegression';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Activity, Play, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export const DemandPrediction = () => {
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [lossHistory, setLossHistory] = useState<{ epoch: number; loss: number }[]>([]);
    const [model, setModel] = useState<LogisticRegression | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);

    // Prediction State
    const [age, setAge] = useState(30);
    const [hasCondition, setHasCondition] = useState(false);
    const [geneticMarker, setGeneticMarker] = useState(false);
    const [lifestyle, setLifestyle] = useState(50); // 0-100
    const [prediction, setPrediction] = useState<number | null>(null);

    const trainingRef = useRef<boolean>(false);

    const startTraining = async () => {
        setIsTraining(true);
        setProgress(0);
        setLossHistory([]);
        setAccuracy(null);
        trainingRef.current = true;

        // 1. Generate Data
        const dataCount = 1000;
        const rawData = generatePatientData(dataCount);

        // Split into features and labels
        const features = rawData.map(d => [d.age, d.hasCondition, d.geneticMarker, d.lifestyleFactor]);
        const labels = rawData.map(d => d.demand);

        // Split train/test (80/20)
        const splitIdx = Math.floor(dataCount * 0.8);
        const trainX = features.slice(0, splitIdx);
        const trainY = labels.slice(0, splitIdx);
        const testX = features.slice(splitIdx);
        const testY = labels.slice(splitIdx);

        // 2. Initialize Model
        const lr = new LogisticRegression(4, 0.1);
        const epochs = 50;

        // 3. Train Loop (with small delays to allow UI updates)
        for (let i = 0; i < epochs; i++) {
            if (!trainingRef.current) break;

            const loss = lr.train(trainX, trainY);

            setLossHistory(prev => [...prev, { epoch: i + 1, loss }]);
            setProgress(((i + 1) / epochs) * 100);

            // Yield to main thread
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // 4. Evaluate
        let correct = 0;
        for (let i = 0; i < testX.length; i++) {
            const p = lr.predict(testX[i]);
            const predLabel = p > 0.5 ? 1 : 0;
            if (predLabel === testY[i]) correct++;
        }
        setAccuracy((correct / testX.length) * 100);

        setModel(lr);
        setIsTraining(false);
        trainingRef.current = false;
    };

    const handlePredict = () => {
        if (!model) return;

        // Normalize inputs to match training data format
        const normAge = age / 100; // Assuming max age 100
        const normCondition = hasCondition ? 1 : 0;
        const normGenetics = geneticMarker ? 1 : 0;
        const normLifestyle = lifestyle / 100;

        const prob = model.predict([normAge, normCondition, normGenetics, normLifestyle]);
        setPrediction(prob);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Drug Demand Prediction (ML)</h1>
                    <p className="text-gray-500">Train a Logistic Regression model on synthetic patient data to predict prescription demand.</p>
                </div>
                {!isTraining ? (
                    <button
                        onClick={startTraining}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Play className="w-4 h-4" />
                        Train Model
                    </button>
                ) : (
                    <button
                        onClick={() => { trainingRef.current = false; setIsTraining(false); }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Stop Training
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Training Visualization */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            Training Progress
                        </h2>
                        {accuracy !== null && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Accuracy: {accuracy.toFixed(1)}%
                            </span>
                        )}
                    </div>

                    <div className="h-64 w-full">
                        {lossHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lossHistory}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="epoch" label={{ value: 'Epoch', position: 'insideBottom', offset: -5 }} />
                                    <YAxis label={{ value: 'Loss', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="loss" stroke="#4f46e5" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg">
                                Click "Train Model" to start
                            </div>
                        )}
                    </div>

                    {isTraining && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}%</p>
                        </div>
                    )}
                </div>

                {/* Prediction Interface */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                        <Brain className="w-5 h-5 text-purple-600" />
                        Patient Profile Prediction
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age: {age}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={age}
                                onChange={(e) => setAge(parseInt(e.target.value))}
                                className="w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lifestyle Score (0-100): {lifestyle}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={lifestyle}
                                onChange={(e) => setLifestyle(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <p className="text-xs text-gray-500">Higher is healthier</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hasCondition}
                                    onChange={(e) => setHasCondition(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Has Condition</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={geneticMarker}
                                    onChange={(e) => setGeneticMarker(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">Genetic Marker</span>
                            </label>
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={!model}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${model
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {model ? 'Predict Demand' : 'Train Model First'}
                        </button>

                        {prediction !== null && (
                            <div className={`mt-4 p-4 rounded-lg border ${prediction > 0.5 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                }`}>
                                <div className="flex items-center gap-3">
                                    {prediction > 0.5 ? (
                                        <AlertCircle className="w-8 h-8 text-red-600" />
                                    ) : (
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                    )}
                                    <div>
                                        <h3 className={`font-bold ${prediction > 0.5 ? 'text-red-800' : 'text-green-800'}`}>
                                            {prediction > 0.5 ? 'High Demand Likely' : 'Low Demand Likely'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Probability: {(prediction * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
