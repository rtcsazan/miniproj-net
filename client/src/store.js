import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios'
import io from 'socket.io-client';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    me: {
      username: "",
      id: "",
      display_name: ""
    },
    contactList: [],
    messages: {},
    connected: false,
    socket: null
  },
  getters: {
    contactByID: state => id => {
      return state.contactList.find(contact => contact._id === id)
    }
  },
  mutations: {
    SET_CONTACTS(state, contacts) {
      state.contactList = contacts
    },
    SET_USER(state, user) {
      state.me = user
    },
    SET_SOCKET(state, socket) {
      state.socket = socket
    },
    SET_CONNECTED(state, connected) {
      state.connected = connected
    }
  },
  actions: {
    updateContacts({ commit }) {
      axios.get('/contact')
      .then(response => {
        console.log(response.data);
        commit('SET_CONTACTS', response.data)
      })
      .catch(err =>{
        console.log(err)
      })
    },
    createWS({ commit }) {
      let socket = io.connect('http://localhost:8080/', {
        'query': 'token=' + window.sessionStorage.jwt
      });
      commit('SET_SOCKET', socket)
      socket.on('connect', function () {
        commit('SET_CONNECTED', true)
      });
      socket.on('unauthorized', function(msg) {
        console.log("unauthorized: " + JSON.stringify(msg.data));
        throw new Error(msg.data.type);
      });
      socket.on('msgback', function (data) {
        console.log(data)
      })
    }
  }
})
