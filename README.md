[![CodeQL](https://github.com/lectureStudio/lecturePlayer/actions/workflows/codeql.yml/badge.svg?branch=main&event=push)](https://github.com/lectureStudio/lecturePlayer/actions/workflows/codeql.yml)

## lecturePlayer

Browser-based streaming player that is used to render real-time presentations streamed with lectureStudio tools.  

### Build Notes

Building with Maven:
```
mvn package
```

Building with npm:

1. Navigate to the directory `src/main/frontend`
2. Run `npm run build:prod` or `npm run build:dev` for a production or development build

The target directory for build files is: `src/main/resources/web-player-js`
