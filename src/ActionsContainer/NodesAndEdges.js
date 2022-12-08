import { createReducer } from '@reduxjs/toolkit';

const initialState = {
    nodesStored: [null],
    edgesStored: [null]
}

export const StoreNodesAndEdges = createReducer(initialState, {

    storeNodes: (state, action) => {
        state.nodesStored = action.payload;
    },

    storeEdges: (state, action) => {
        state.edgesStored = action.payload;
    }
});
