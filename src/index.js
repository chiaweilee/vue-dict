const component = {
  template: `<span class="vue-diction-wrapper" v-on:click="speak">
    <span class="vue-diction-word">{{ word }}</span>
    <svg
      class="vue-diction-icon"
      t="1642315674126"
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1497"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="15"
      height="15"
      style="vertical-align:text-bottom"
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
    <span class="vue-diction-symbol" v-if="symbol"> [{{ symbol }}] </span>
  </span>`,
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
  },
  data: function () {
    return {
      symbol: undefined,
    };
  },
  methods: {
    speak: function () {
      this.getCache()
        .then((dict) => {
          if (Array.isArray(dict) && dict.length) {
            const { phonetics } = dict[0];
            if (Array.isArray(phonetics) && phonetics.length) {
              const { audio, text } = phonetics[0];
              if (typeof text === 'string' && text) {
                this.symbol = text;
              }
              if (audio) {
                this.play(audio, function () {
                  //
                });
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
    play: function (src) {
      const player = document.createElement('audio');
      const source = document.createElement('source');
      source.src = src;
      player.appendChild(source);
      player.autoplay = true;
      player.onended = function () {
        document.body.removeChild(player);
      };
      document.body.appendChild(player);
    }
  },
};

window.vueDiction = component;

export default component;
