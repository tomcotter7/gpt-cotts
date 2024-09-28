import { StateNode } from "@tldraw/editor"

class Teach extends StateNode {
    static override id = "teach"
    static override initial = "idle"

    onPointerDown(info: TLPointerEventInfo) {
        console.log("pointer down", info)
    }
}

export default Teach
