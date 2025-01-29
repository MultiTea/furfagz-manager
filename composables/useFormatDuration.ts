export function useFormatDuration() {
    function formatDuration(duration: string) {
      const [minutes, seconds] = duration.split(':');
      return `${minutes}:${seconds.padStart(2, '0')}`;
    }
  
    function calculateTotalDuration(durations: string[]) {
      let totalMinutes = 0;
      let totalSeconds = 0;
  
      durations.forEach(duration => {
        const [minutes, seconds] = duration.split(':').map(Number);
        totalMinutes += minutes;
        totalSeconds += seconds;
      });
  
      totalMinutes += Math.floor(totalSeconds / 60);
      totalSeconds = totalSeconds % 60;
  
      return `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
    }
  
    return {
      formatDuration,
      calculateTotalDuration
    };
  }