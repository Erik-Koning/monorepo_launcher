// silence-detector-processor.js

class SilenceDetectorProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.silentThreshold = 0.02; // Adjust as needed
    this.silentDuration = 700; // Silence duration threshold in milliseconds
    this.silentSamples = 0;
    this.sampleRate = options?.processorOptions?.sampleRate ?? 44100;
    this.silenceThresholdSamples = (this.sampleRate * this.silentDuration) / 1000;
    this.ignoreSilenceDuration = processorOptions?.ignoreSilenceDuration ?? 12000; // Ignore silence for the first 12 seconds

    this.port.onmessage = (event) => {
      if (event.data && event.data.command === "reset") {
        this.silentSamples = 0;
      }
    };
  }

  static get parameterDescriptors() {
    return [];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length === 0) {
      return true;
    }

    const samples = input[0];
    const numSamples = samples.length;

    // Update elapsed samples
    this.elapsedSamples += numSamples;

    // Only start silence detection after ignoreSilenceDuration
    if (this.elapsedSamples >= this.ignoreSilenceSamples) {
      let silent = true;

      for (let i = 0; i < numSamples; i++) {
        if (Math.abs(samples[i]) > this.silentThreshold) {
          silent = false;
          break;
        }
      }

      if (silent) {
        this.silentSamples += numSamples;
        if (this.silentSamples >= this.silenceThresholdSamples) {
          this.port.postMessage({ event: "silence" });
          this.silentSamples = 0; // Reset counter after detecting silence
        }
      } else {
        this.silentSamples = 0;
      }
    } else {
      // Reset silentSamples if we're still within the ignore duration
      this.silentSamples = 0;
    }

    return true;
  }
}

registerProcessor("silence-detector-processor", SilenceDetectorProcessor);
