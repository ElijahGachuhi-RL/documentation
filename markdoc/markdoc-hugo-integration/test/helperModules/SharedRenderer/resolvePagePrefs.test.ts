import {
  PrefOptionsConfig,
  PrefOptionsConfigSchema
} from '../../../src/schemas/yaml/prefOptions';
import { Frontmatter, FrontmatterSchema } from '../../../src/schemas/yaml/frontMatter';
import { describe, test, expect } from 'vitest';
import { ConfigProcessor } from '../../../src/helperModules/ConfigProcessor';
import { SharedRenderer } from '../../../src/helperModules/SharedRenderer';
import { ResolvedPagePrefsSchema } from '../../../src/schemas/resolvedPagePrefs';

const prefOptionsConfig: PrefOptionsConfig = {
  color_options: [
    { identifier: 'blue', display_name: 'Blue', default: true },
    { identifier: 'red', display_name: 'Red' }
  ],
  finish_options: [
    { identifier: 'matte', display_name: 'Matte' },
    { identifier: 'eggshell', display_name: 'Eggshell', default: true },
    { identifier: 'gloss', display_name: 'Gloss' }
  ],
  matte_blue_paint_options: [
    { identifier: 'powder_blue', display_name: 'Powder Blue', default: true }
  ],
  eggshell_blue_paint_options: [
    { identifier: 'elegant_royal', display_name: 'Elegant Royal', default: true },
    { identifier: 'robins_egg', display_name: "Robin's Egg" }
  ],
  gloss_blue_paint_options: [
    { identifier: 'sky_blue', display_name: 'Sky Blue', default: true },
    { identifier: 'navy', display_name: 'Navy' }
  ],
  matte_red_paint_options: [
    { identifier: 'brick', display_name: 'Brick', default: true },
    { identifier: 'scarlet', display_name: 'Scarlet' }
  ],
  eggshell_red_paint_options: [
    { identifier: 'rose', display_name: 'Rose', default: true },
    { identifier: 'ruby', display_name: 'Ruby' }
  ],
  gloss_red_paint_options: [
    { identifier: 'fire_engine', display_name: 'Fire Engine', default: true },
    { identifier: 'crimson', display_name: 'Crimson' }
  ]
};
PrefOptionsConfigSchema.parse(prefOptionsConfig);

const frontmatter: Frontmatter = {
  title: 'My Page',
  page_preferences: [
    {
      display_name: 'Color',
      identifier: 'color',
      options_source: 'color_options'
    },
    {
      display_name: 'Finish',
      identifier: 'finish',
      options_source: 'finish_options'
    },
    {
      display_name: 'Paint color',
      identifier: 'paint',
      options_source: '<FINISH>_<COLOR>_paint_options'
    }
  ]
};
FrontmatterSchema.parse(frontmatter);

describe('SharedRenderer.resolvePagePrefs', () => {
  test('resolves to the correct values for the default selections', () => {
    const valsByPrefId = ConfigProcessor.getDefaultValuesByPrefId(
      frontmatter,
      prefOptionsConfig
    );

    const resolvedPagePrefs = SharedRenderer.resolvePagePrefs({
      pagePrefsConfig: frontmatter.page_preferences!,
      prefOptionsConfig,
      valsByPrefId
    });
    ResolvedPagePrefsSchema.parse(resolvedPagePrefs);

    expect(resolvedPagePrefs.color.currentValue).toEqual('blue');
    expect(resolvedPagePrefs.finish.currentValue).toEqual('eggshell');
    expect(resolvedPagePrefs.paint.currentValue).toEqual('elegant_royal');
    expect(resolvedPagePrefs.paint.options.map((o) => o.id)).toEqual([
      'elegant_royal',
      'robins_egg'
    ]);
  });

  test('resolves to the correct values when selections are changed', () => {
    const valsByPrefId = ConfigProcessor.getDefaultValuesByPrefId(
      frontmatter,
      prefOptionsConfig
    );

    valsByPrefId.color = 'red';
    valsByPrefId.finish = 'gloss';

    const resolvedPagePrefs = SharedRenderer.resolvePagePrefs({
      pagePrefsConfig: frontmatter.page_preferences!,
      prefOptionsConfig,
      valsByPrefId
    });
    ResolvedPagePrefsSchema.parse(resolvedPagePrefs);

    expect(resolvedPagePrefs.color.currentValue).toEqual('red');
    expect(resolvedPagePrefs.finish.currentValue).toEqual('gloss');
    expect(resolvedPagePrefs.paint.currentValue).toEqual('fire_engine');
    expect(resolvedPagePrefs.paint.options.map((o) => o.id)).toEqual([
      'fire_engine',
      'crimson'
    ]);
  });
});
