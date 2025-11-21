export class LogisticRegression {
    private weights: number[];
    private bias: number;
    private learningRate: number;

    constructor(featureCount: number, learningRate: number = 0.1) {
        this.weights = new Array(featureCount).fill(0).map(() => Math.random() * 0.1); // Small random init
        this.bias = 0;
        this.learningRate = learningRate;
    }

    // Sigmoid activation function
    private sigmoid(z: number): number {
        return 1 / (1 + Math.exp(-z));
    }

    // Predict probability for a single instance
    public predict(features: number[]): number {
        if (features.length !== this.weights.length) {
            throw new Error("Feature count mismatch");
        }

        const z = features.reduce((sum, val, idx) => sum + val * this.weights[idx], this.bias);
        return this.sigmoid(z);
    }

    // Train the model using Gradient Descent
    // Returns the average loss for this epoch
    public train(features: number[][], labels: number[]): number {
        let totalLoss = 0;
        const m = features.length;

        // Gradients
        let dw = new Array(this.weights.length).fill(0);
        let db = 0;

        for (let i = 0; i < m; i++) {
            const x = features[i];
            const y = labels[i];
            const y_hat = this.predict(x);

            // Binary Cross-Entropy Loss
            // Avoid log(0) by clamping
            const epsilon = 1e-15;
            const y_pred = Math.max(epsilon, Math.min(1 - epsilon, y_hat));
            totalLoss += -(y * Math.log(y_pred) + (1 - y) * Math.log(1 - y_pred));

            // Calculate gradients
            const error = y_hat - y;
            for (let j = 0; j < this.weights.length; j++) {
                dw[j] += error * x[j];
            }
            db += error;
        }

        // Update weights and bias
        for (let j = 0; j < this.weights.length; j++) {
            this.weights[j] -= (this.learningRate * dw[j]) / m;
        }
        this.bias -= (this.learningRate * db) / m;

        return totalLoss / m;
    }

    public getWeights(): number[] {
        return this.weights;
    }

    public getBias(): number {
        return this.bias;
    }
}
