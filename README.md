
## No More Wasted Backstabs
Tera-Proxy module for Tera Online. Blocks targeted teleport skills without a target.
### Known Issues
* Using Brawler's skill: Meat Grinder on a target in-range but not knocked up will still consume the cooldown.
* Using any skill with impassable terrain between you and your target in-range will still consume the cooldown.
* Ninja's Decoy Jutsu and Valkyrie's Backstab are disabled by default as I have been unable to test them. They can be enabled in config.js (So far they seem to work). 
    * Pinkie Pie's [Skill Prediction](https://github.com/pinkipi/skill-prediction) already includes Ninja's Decoy Jutsu and Valkyrie's Backstab fix. So if you use that module, enabling these skills in config.js is unneccessary.
### Requirements
[Tera-Proxy](https://github.com/meishuu/tera-proxy) and dependencies

The following opcodes must be mapped in your `tera-proxy/node_modules/tera-data/map/protocol.{version}.map` file:
* C_START_TARGETED_SKILL
* S_CANNOT_START_SKILL
* S_LOGIN
