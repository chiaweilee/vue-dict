Inspire by https://github.com/meetDeveloper/freeDictionaryAPI

## Example

<button><vue-diction word="hello"></vue-diction></button>

## Usage

### Vue Usage

```js
import VueDiction from 'vue-diction';
```

```vue
<vue-diction word="hello"></vue-diction>
```

```vue
<vue-diction word="hello" languageCode="en_GB"></vue-diction>
```

*for more detail, please check* https://github.com/meetDeveloper/freeDictionaryAPI

### CDN Usage

example of docsify

```html
<script>
  window.$docsify = {
    vueComponents: {
      'vue-diction': window.vueDiction,
    }
  };
</script>
<script src="//cdn.jsdelivr.net/npm/vue-diction"></script>
<script src="//cdn.jsdelivr.net/npm/vue@2/dist/vue.min.js"></script>
<script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
```

### Props

- **version**, Number, default to `2`
- **languageCode**, String, default to `en_GB`

## Roadmap

[x] cache
[x] phonetic
[ ] meanings
[ ] origin