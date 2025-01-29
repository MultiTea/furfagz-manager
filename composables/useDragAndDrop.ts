export function useDragAndDrop<T>(items: Ref<T[]>, onOrderChange: (items: T[]) => void) {
    const draggedItem = ref<number | null>(null);
    const dropTarget = ref<number | null>(null);
  
    function dragStart(event: DragEvent, index: number) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        draggedItem.value = index;
      }
    }
  
    function dragEnd() {
      draggedItem.value = null;
      dropTarget.value = null;
    }
  
    function dragOver(event: DragEvent, index: number) {
      if (draggedItem.value === null || draggedItem.value === index) return;
      event.dataTransfer!.dropEffect = 'move';
    }
  
    function dragEnter(index: number) {
      if (draggedItem.value === null || draggedItem.value === index) return;
      dropTarget.value = index;
    }
  
    function dragLeave(index: number) {
      if (dropTarget.value === index) {
        dropTarget.value = null;
      }
    }
  
    async function drop(event: DragEvent, dropIndex: number) {
      event.stopPropagation();
      
      if (draggedItem.value === null || draggedItem.value === dropIndex) return;
      
      try {
        const newItems = [...items.value];
        const [removed] = newItems.splice(draggedItem.value, 1);
        newItems.splice(dropIndex, 0, removed);
        
        await onOrderChange(newItems);
      } finally {
        draggedItem.value = null;
        dropTarget.value = null;
      }
    }
  
    return {
      draggedItem,
      dropTarget,
      dragStart,
      dragEnd,
      dragOver,
      dragEnter,
      dragLeave,
      drop
    };
  }