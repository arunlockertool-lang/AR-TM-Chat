/**
 * Audio voice note recording helper using browser MediaRecorder
 */
export interface VoiceRecordingResult {
  audioUrl: string;
  duration: number; // in seconds
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.audioChunks = [];
    this.startTime = Date.now();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
    } catch (err) {
      console.warn('Microphone access denied or unavailable, fallback simulation mode available:', err);
      throw err;
    }
  }

  stop(): Promise<VoiceRecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        
        // Convert to data URL so it can be stored persistently in storage/indexedDB
        const reader = new FileReader();
        reader.onloadend = () => {
          const audioUrl = reader.result as string;
          resolve({ audioUrl, duration });
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to turn off recording indicator
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}
