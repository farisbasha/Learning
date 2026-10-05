// Engine entry: everything topics need lives on window.AN.
import * as timeline from './timeline.js';
import * as kit from './kit.jsx';
import { TopicVideo, StageBox, SceneLayer, fmtTime } from './player.jsx';
import { Mini, CodeBlock } from './notes.jsx';
import { registerTopic, mountTopic, getTopic } from './topic.jsx';
import { mountHub } from './hub.jsx';

window.AN = { ...kit, ...timeline, TopicVideo, StageBox, SceneLayer, fmtTime, Mini, CodeBlock, registerTopic, mountTopic, getTopic, mountHub };
