import axios from 'axios'
import { apiUrl, ExcelDownloadFormat } from './settings'
import {
    fullBrowserVersion,
    browserName,
    osVersion,
    osName
} from "react-device-detect";
import { saveAs } from 'file-saver';
import moment from 'moment'
let authAxios = axios.create({
    baseURL: apiUrl
})

export const getToken = () => {
    return {
        headers: {
            Authorization: 'Token ' + localStorage.getItem('token'),
            type: "WEB",
            fullbrowserversion: fullBrowserVersion,
            browsername: browserName,
            osversion: osVersion,
            osname: osName
        }
    }
}
export const getTokenFromParams = (token) => {
    return {
        headers: {
            Authorization: 'Token ' + token,
            type: "WEB",
            fullbrowserversion: fullBrowserVersion,
            browsername: browserName,
            osversion: osVersion,
            osname: osName
        }
    }
}
export const getTokenFromParamsForFile = (token) => {
    return {
        headers: {
            Authorization: 'Token ' + token,
            'content-type': 'multipart/form-data; boundary=ebf9f03029db4c2799ae16b5428b06bd',
            type: "WEB",
            fullbrowserversion: fullBrowserVersion,
            browsername: browserName,
            osversion: osVersion,
            osname: osName
        }
    }
}
class Request {

    error = err => {
        try {
            if (err.response.status === 401) {
                localStorage.clear()
                window.location.href = ''
            }
        } catch (e) {
        }
    }

    // ------------------------------------------- API Start from here --------------------------------------------- //
    getNodes() {
        return new Promise((next, error) => {
            authAxios
                .post(`/ivrtree_node_list/`, {})
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
    getEdges() {
        return new Promise((next, error) => {
            authAxios
                .post(`/node_edge_list/`, {})
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
    createNode(trigger_digit, action_type, action) {
        return new Promise((next, error) => {
            authAxios
                .post(`/ivrtree_node/`, { trigger_digit: trigger_digit, action_type: action_type, action: action })
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
    createEdge(e_id, source, target) {
        return new Promise((next, error) => {
            authAxios
                .post(`/node_edge/`, { e_id: e_id, source: source, target: target })
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
    deleteNode(id) {
        return new Promise((next, error) => {
            authAxios
                .post(`/ivrtree_node_delete/${id}/`, {})
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
    updateNode(trigger_digit, action_type, action, id) {
        return new Promise((next, error) => {
            authAxios
                .post(`/ivrtree_node_update/${id}/`, { trigger_digit: trigger_digit, action_type: action_type, action: action })
                .then(d => {
                    next(d.data)
                })
                .catch(err => {
                    next({ error: true, err })
                    this.error(err)
                })
        })
    }
}

export default new Request();