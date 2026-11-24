import { describe, it, expect } from 'vitest';
import {
  CAMPAIGN_THEMES,
  getCampaignTheme,
  getSuggestedHomeSectionsTemplate,
  resolveActiveHomeSections,
} from './index.js';

describe('Módulo de Campañas en Portada y Temas (Parte 4 de 5)', () => {
  describe('Presets de Temas de Campaña', () => {
    it('debe definir los 7 presets requeridos con contraste y atributos visuales por código', () => {
      const requiredThemes = [
        'black-friday',
        'cyber-sale',
        'dia-de-la-madre',
        'san-valentin',
        'navidad',
        'liquidacion',
        'neutro',
      ];

      requiredThemes.forEach((key) => {
        const theme = CAMPAIGN_THEMES[key];
        expect(theme, `El preset ${key} debe existir`).toBeDefined();
        expect(theme.name).toBeTypeOf('string');
        expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
        expect(theme.badgeBg).toBeTypeOf('string');
        expect(theme.badgeText).toBeTypeOf('string');
        expect(theme.borderAccent).toBeTypeOf('string');
        expect(theme.bgGradient).toBeTypeOf('string');
      });
    });

    it('getCampaignTheme debe retornar el preset correcto o fallback a neutro', () => {
      const bf = getCampaignTheme('black-friday');
      expect(bf.id).toBe('black-friday');
      expect(bf.tagText).toBe('BLACK FRIDAY');

      const unknown = getCampaignTheme('inexistente');
      expect(unknown.id).toBe('neutro');
      expect(unknown.name).toBe('Neutro de Marca');
    });
  });

  describe('Plantillas Sugeridas de Secciones (HomeSections)', () => {
    it('la plantilla base debe proveer los 6 bloques estándar de la tienda', () => {
      const base = getSuggestedHomeSectionsTemplate('base');
      expect(Array.isArray(base)).toBe(true);
      expect(base.length).toBe(6);

      const types = base.map((s) => s.type);
      expect(types).toEqual([
        'HERO',
        'CATEGORY_GRID',
        'PRODUCT_GRID',
        'TEXT_BLOCK',
        'BENEFITS',
        'FAQ',
      ]);
      expect(base[0].order).toBe(0);
      expect(base[5].order).toBe(5);
    });

    it('la plantilla black-friday debe incluir HERO agresivo, COUNTDOWN y grilla de ofertas', () => {
      const bf = getSuggestedHomeSectionsTemplate('black-friday', {
        endsAt: '2026-11-28T23:59:59.000Z',
      });
      const types = bf.map((s) => s.type);
      expect(types).toContain('HERO');
      expect(types).toContain('COUNTDOWN');
      expect(types).toContain('PRODUCT_GRID');

      const hero = bf.find((s) => s.type === 'HERO');
      expect(hero.config.headline).toContain('BLACK FRIDAY');

      const countdown = bf.find((s) => s.type === 'COUNTDOWN');
      expect(countdown.config.targetDate).toBe('2026-11-28T23:59:59.000Z');
    });

    it('la plantilla dia-de-la-madre debe incluir CAMPAIGN_BANNER, COUNTDOWN y grilla', () => {
      const madre = getSuggestedHomeSectionsTemplate('dia-de-la-madre', {
        slug: 'dia-de-la-madre',
        endsAt: '2026-11-08T23:59:59.000Z',
      });
      const types = madre.map((s) => s.type);
      expect(types[0]).toBe('CAMPAIGN_BANNER');
      expect(types[1]).toBe('COUNTDOWN');
      expect(madre[0].config.ctaLink).toBe('/campanas/dia-de-la-madre');
    });
  });

  describe('Resolución Dinámica de Portada (resolveActiveHomeSections)', () => {
    const allSections = [
      { id: 'b1', campaignId: null, type: 'HERO', order: 0, enabled: true },
      { id: 'b2', campaignId: null, type: 'CATEGORY_GRID', order: 1, enabled: true },
      { id: 'b3', campaignId: null, type: 'BENEFITS', order: 2, enabled: true },
      { id: 'm1', campaignId: 'camp_madre', type: 'CAMPAIGN_BANNER', order: 0, enabled: true },
      { id: 'm2', campaignId: 'camp_madre', type: 'PRODUCT_GRID', order: 1, enabled: true },
      { id: 'bf1', campaignId: 'camp_bf', type: 'HERO', order: 0, enabled: true },
      { id: 'bf2', campaignId: 'camp_bf', type: 'COUNTDOWN', order: 1, enabled: true },
    ];

    it('si no hay campañas activas, debe resolver la portada base', () => {
      const resolved = resolveActiveHomeSections({
        allSections,
        activeCampaign: null,
        previewCampaign: null,
      });

      expect(resolved.activeCampaign).toBeNull();
      expect(resolved.isPreview).toBe(false);
      expect(resolved.sections.length).toBe(3);
      expect(resolved.sections.map((s) => s.id)).toEqual(['b1', 'b2', 'b3']);
      expect(resolved.theme.id).toBe('neutro');
    });

    it('si hay una campaña activa, debe resolver sus secciones y su tema', () => {
      const activeCamp = {
        id: 'camp_madre',
        name: 'Día de la Madre',
        theme: 'dia-de-la-madre',
      };

      const resolved = resolveActiveHomeSections({
        allSections,
        activeCampaign: activeCamp,
        previewCampaign: null,
      });

      expect(resolved.activeCampaign).toEqual(activeCamp);
      expect(resolved.isPreview).toBe(false);
      expect(resolved.sections.length).toBe(2);
      expect(resolved.sections.map((s) => s.id)).toEqual(['m1', 'm2']);
      expect(resolved.theme.id).toBe('dia-de-la-madre');
    });

    it('el modo vista previa (previewCampaign) debe primar sobre la campaña activa', () => {
      const activeCamp = {
        id: 'camp_madre',
        name: 'Día de la Madre',
        theme: 'dia-de-la-madre',
      };
      const previewCamp = {
        id: 'camp_bf',
        name: 'Black Friday',
        theme: 'black-friday',
      };

      const resolved = resolveActiveHomeSections({
        allSections,
        activeCampaign: activeCamp,
        previewCampaign: previewCamp,
      });

      expect(resolved.isPreview).toBe(true);
      expect(resolved.activeCampaign).toEqual(previewCamp);
      expect(resolved.sections.map((s) => s.id)).toEqual(['bf1', 'bf2']);
      expect(resolved.theme.id).toBe('black-friday');
    });

    it('si una campaña no tiene secciones personalizadas, debe caer a la portada base pero conservar el contexto de campaña', () => {
      const campWithoutSections = {
        id: 'camp_nueva',
        name: 'Campaña Sin Secciones',
        theme: 'cyber-sale',
      };

      const resolved = resolveActiveHomeSections({
        allSections,
        activeCampaign: campWithoutSections,
        previewCampaign: null,
      });

      expect(resolved.activeCampaign).toEqual(campWithoutSections);
      expect(resolved.sections.map((s) => s.id)).toEqual(['b1', 'b2', 'b3']);
      expect(resolved.theme.id).toBe('cyber-sale');
    });
  });
});
