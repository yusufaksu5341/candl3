// Widget type being dragged from the customize panel. dataTransfer can't be read
// during dragover, so the grid looks it up here to size the drop preview.
export let draggingWidget: string | undefined

export const setDraggingWidget = (type?: string) => { draggingWidget = type }
