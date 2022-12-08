import { configureStore } from '@reduxjs/toolkit'
import { StoreNodesAndEdges } from '../src/ActionsContainer/NodesAndEdges.js'

const store = configureStore({
    reducer: {
        NodesAndEdges: StoreNodesAndEdges,
    }
})
export default store;