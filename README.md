### Lightweight Config File (lcf)
Is a Lightweight configuration file made for all those aplications than need one of this, we support js with our package `lcf` and for java we jave our maven [lib]() than you can use anywhere.

```c#
::{path}
    {key}>>{value}
    ::{subPath}
        {key}>>{value}
```

```c#
::config
    debug>>true
    ::production
        port>>80
```

This are the supported data types for the values.
```c#
["", "", ""]

[0, 0, 0]

[true, false, false]

""

true/false

5

0.50
```

Also if you are using vscode and other code editor u can install lcf-linter.

```
${key}>>{value}
```

wiht the `$` symbol you can hide values from text hover at code.

### Node.js
In javascript you can install `lcf-lib` by executing the following command. (Types inluded)
```bash
npm install lcf-lib
```
Now you can use the lib.
```ts
import { LCFConfigInstance } from "lcf-lib"

const config = LCFConfigInstance("./config.lcf")

const debug = config.get("config:debug")
const debug = config.get("config:production:port")
```

