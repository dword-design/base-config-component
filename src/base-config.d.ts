import type { Config } from '@dword-design/base';

export type BaseConfig = Config & {
  componentName?: string;
  cdnExtraScripts?: string[];
}; // TODO: Fields should be mandatory and defaulted in Base
