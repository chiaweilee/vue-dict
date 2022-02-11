import './index.less';
import icons from './icons';

const defaultProps = {
  version: 2,
  languageCode: 'en_GB',
  showOrigin: true,
  showMeanings: true,
  autoLoad: false,
};

const createComponent = function (props) {
  const inheritProps = Object.assign(defaultProps, props || {});
  return {
    template: `<div class="vue-diction-wrapper" v-on:click="load">
      <div class="vue-diction-word" v-on:click="play">
        {{ word }}
        <span v-if="!loaded && !loading" class="vue-diction-icon">
          ${icons.dict}
        </span>
        <span v-if="!loaded && loading" class="vue-diction-icon">
          ${icons.loading}
        </span>
        <span class="vue-diction-symbol" v-if="symbol">[{{ symbol }}]</span>
        <span v-if="audio" class="vue-diction-icon">
          ${icons.play}
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
        default: inheritProps.version,
      },
      languageCode: {
        type: String,
        default: inheritProps.languageCode,
      },
      showOrigin: {
        type: Boolean,
        default: inheritProps.showOrigin,
      },
      showMeanings: {
        type: Boolean,
        default: inheritProps.showMeanings,
      },
      autoLoad: {
        type: Boolean,
        default: inheritProps.autoLoad,
      },
    },
    data: function () {
      return {
        loaded: false,
        loading: false,
        audio: undefined,
        symbol: undefined,
        origin: undefined,
        meanings: [],
      };
    },
    mounted() {
      if (this.autoLoad) {
        this.load();
      }
    },
    methods: {
      load: function () {
        if (this.loaded) return;
        this.loading = true;
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
          .finally(() => {
            this.loading = false;
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
};

const component = createComponent(defaultProps);

window.vueDiction = component;
window.vueDictionExtend = createComponent;

export default component;
