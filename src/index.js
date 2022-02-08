import './index.less';

const component = {
  template: `<div class="vue-diction-wrapper" v-on:click="load">
    <div class="vue-diction-word" v-on:click="play">
      {{ word }}
      <span v-if="!loaded" class="vue-diction-icon">
        <svg t="1644329794853" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2216" width="15" height="15"><path d="M764 888H200V324a4 4 0 0 0-4-4h-64a4 4 0 0 0-4 4v596a40 40 0 0 0 40 40h596a4 4 0 0 0 4-4v-64a4 4 0 0 0-4-4zM551.9 311.8h-57.5v327.1h56.8c83 0 120.4-60.6 120.4-172.6 0-99.9-40.2-154.5-119.7-154.5zM856 128H312a40 40 0 0 0-40 40v608a40 40 0 0 0 40 40h544a40 40 0 0 0 40-40V168a40 40 0 0 0-40-40zM552.8 694H430.2a4 4 0 0 1-4-4V260a4 4 0 0 1 4-4h128.5c116 0 183.1 74.2 183.1 208.9 0 144.8-63.5 229.1-189 229.1z" p-id="2217"></path></svg>
      </span>
      <span class="vue-diction-symbol" v-if="symbol">[{{ symbol }}]</span>
      <span v-if="audio" class="vue-diction-icon">
        <svg
        t="1642315674126"
        class="icon" 
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="1497"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="15"
        height="15"
        >
          <path
            d="M513.066667 706.090667c105.856 0 192-81.344 192-181.376L705.066667 268.629333c0-99.882667-86.144-181.12-192-181.12s-192 81.258667-192 181.12l0 256.085333C321.066667 624.725333 407.210667 706.090667 513.066667 706.090667zM363.733333 268.629333c0-76.352 66.986667-138.453333 149.333333-138.453333s149.333333 62.122667 149.333333 138.453333l0 256.085333c0 76.48-67.008 138.709333-149.333333 138.709333s-149.333333-62.229333-149.333333-138.709333L363.733333 268.629333z"
            p-id="1498"
          ></path>
          <path
            d="M833.088 319.957333c-11.797333 0-21.333333 9.557333-21.333333 21.333333l0 127.786667c0 166.037333-133.973333 301.12-298.666667 301.12-164.693333 0-298.666667-135.082667-298.666667-301.12l0-127.786667c0-11.776-9.557333-21.333333-21.333333-21.333333s-21.333333 9.557333-21.333333 21.333333l0 127.786667c0 182.314667 141.738667 331.52 320 342.698667l0 84.16-192 0c-11.776 0-21.333333 9.536-21.333333 21.333333s9.557333 21.333333 21.333333 21.333333L726.4 938.602667c11.797333 0 21.333333-9.536 21.333333-21.333333s-9.536-21.333333-21.333333-21.333333l-191.978667 0 0-84.16c178.261333-11.178667 320-160.405333 320-342.698667l0-127.786667C854.421333 329.514667 844.885333 319.957333 833.088 319.957333z"
            p-id="1499"
          ></path>
        </svg>
      </span>
    </div>
    <div v-if="meanings.length" class="vue-diction-meanings">
      <div v-for="meaning in meanings" :key="JSON.stringify(meaning.definitions)" class="vue-diction-meaning">
        <div class="vue-diction-part-of-speech">{{ meaning.partOfSpeech }}.</div>
        <div class="vue-diction-definition" v-for="definition in meaning.definitions">
          {{ definition.definition }}
          <div class="vue-diction-example">
            <span class="vue-diction-label">[example]</span>
            <span>{{ definition.example }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="origin" class="vue-diction-origin">
      <span class="vue-diction-label">[origin]</span>
      <span>{{ origin }}</span>
    </div>
  </div>`,
  props: {
    word: String,
    version: {
      type: Number,
      default: 2,
    },
    languageCode: {
      type: String,
      default: 'en_GB',
    },
    showOrigin: {
      type: Boolean,
      default: true,
    },
    showMeanings: {
      type: Boolean,
      default: true,
    },
  },
  data: function () {
    return {
      loaded: false,
      audio: undefined,
      symbol: undefined,
      origin: undefined,
      meanings: [],
    };
  },
  methods: {
    load: function () {
      if (this.loaded) return;
      this.getCache()
        .then((dict) => {
          if (Array.isArray(dict) && dict.length) {
            this.loaded = true;
            const { phonetics, meanings, origin } = dict[0];
            if (this.showOrigin && typeof origin === 'string') {
              this.origin = origin;
            }
            if (this.showMeanings && Array.isArray(meanings)) {
              this.meanings = meanings;
            }
            if (Array.isArray(phonetics) && phonetics.length) {
              const { audio, text } = phonetics[0];
              if (typeof audio === 'string') {
                this.audio = audio;
                this.play();
              }
              if (typeof text === 'string' && text) {
                this.symbol = text;
              }
              return Promise.resolve();
            }
          }
          return Promise.reject();
        })
        .catch(() => {
          //
        });
    },
    getCache: function () {
      const keygen = `vue_diction_cache_${this.word}`;
      const cache = localStorage.getItem(keygen);
      if (cache) {
        return Promise.resolve(JSON.parse(cache));
      } else {
        return this.request()
          .then((response) => {
            // https://github.com/meetDeveloper/googleDictionaryAPI/issues/82
            if (Array.isArray(response) && response.length) {
              const matchedResult = response.filter(
                (res) => res.word === this.word,
              );
              if (matchedResult.length) {
                return Promise.resolve(matchedResult);
              }
            }
            return Promise.reject();
          })
          .then((response) => {
            localStorage.setItem(keygen, JSON.stringify(response));
            return response;
          });
      }
    },
    request: function () {
      const word = this.word;
      const languageCode = this.languageCode;
      const version = this.version;
      return fetch(
        `https://api.dictionaryapi.dev/api/v${version}/entries/${languageCode}/${word}`,
      ).then((res) => res.json());
    },
    play: function () {
      const player = document.createElement('audio');
      const source = document.createElement('source');
      source.src = this.audio;
      player.appendChild(source);
      player.autoplay = true;
      player.onended = function () {
        document.body.removeChild(player);
      };
      document.body.appendChild(player);
    },
  },
};

window.vueDiction = component;

export default component;
