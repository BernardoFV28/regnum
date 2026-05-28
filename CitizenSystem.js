
export const CitizenArchetype = {
    Mask: 1 | 2 | 4 | 8, 
    
    Vitals: {
        hunger: new Float32Array(MAX_ENTITIES),
        warmth: new Float32Array(MAX_ENTITIES),
        infection: new Float32Array(MAX_ENTITIES)
    },
    
    Psychology: {
        sanity: new Float32Array(MAX_ENTITIES),
        fanaticism: new Float32Array(MAX_ENTITIES),
        factionId: new Uint8Array(MAX_ENTITIES)
    }
};

export class CitizenAI {
    static processGOAP(index, archetypes) {
        let hunger = archetypes.Vitals.hunger[index];
        let warmth = archetypes.Vitals.warmth[index];
        let sanity = archetypes.Psychology.sanity[index];
        let faction = archetypes.Psychology.factionId[index];

        // Se o Frio for extremo, prioridade máxima é achar calor, sobrepondo o trabalho
        if (warmth < 20) {
            this.planPathToNearestHeatSource(index, archetypes);
            archetypes.Psychology.sanity[index] -= 0.5; // O frio quebra a mente
            return;
        }

        // Sistema Emergente de Cultos e Facções
        if (sanity < 15 && faction === 0) {
            // NPC Enlouquece e forma/junta-se a uma facção extrema
            archetypes.Psychology.factionId[index] = this.determineExtremeFaction(); // Ex: Culto do Vapor
            window.Events.emit('NARRATIVE_EVENT', "A loucura do frio forjou novos adoradores do Vapor Quente.");
            return;
        }

        // Ciclo normal de trabalho e economia (Logística térmica)
        this.executeProfessionTask(index, archetypes);
    }
}
initPostProcessing() {
    // Pipeline Customizada WebGL
    const customPipeline = new Phaser.Renderer.WebGL.Pipelines.PostFXPipeline({
        game: this.game,
        fragShader: `
            precision mediump float;
            uniform sampler2D uMainSampler;
            uniform float uTime;
            uniform float uFreezeLevel; // Escala de 0.0 a 1.0 baseado na Temperatura
            uniform float uInsanity;    // Aberração cromática
            varying vec2 outTexCoord;

            void main() {
                vec2 uv = outTexCoord;
                
                // Aberração Cromática induzida por Insanidade
                float r = texture2D(uMainSampler, uv + vec2(uInsanity * 0.005, 0.0)).r;
                float g = texture2D(uMainSampler, uv).g;
                float b = texture2D(uMainSampler, uv - vec2(uInsanity * 0.005, 0.0)).b;
                
                vec4 color = vec4(r, g, b, 1.0);
                
                // Vinheta de gelinho
                float dist = distance(uv, vec2(0.5, 0.5));
                float freezeVignette = smoothstep(0.4, 0.8, dist) * uFreezeLevel;
                color.rgb = mix(color.rgb, vec3(0.7, 0.8, 0.9), freezeVignette); // Tintura de gelo

                gl_FragColor = color;
            }
        `
    });

    this.cameras.main.setPostPipeline(customPipeline);
}
