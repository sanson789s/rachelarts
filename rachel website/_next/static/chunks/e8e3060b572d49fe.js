(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,89798,e=>{"use strict";var o=e.i(43476),t=e.i(71645),i=e.i(8560),r=e.i(90072);function n(){let e=(0,t.useRef)(null);return(0,t.useEffect)(()=>{let o;if(!e.current)return;let t=e.current,n=new i.WebGLRenderer({canvas:t,alpha:!0,antialias:!1});n.setPixelRatio(Math.min(window.devicePixelRatio,2)),n.setSize(window.innerWidth,window.innerHeight);let a=new r.Scene,l=new r.PerspectiveCamera(75,window.innerWidth/window.innerHeight,.1,1e3);l.position.z=5;let s=new r.TextureLoader,d=`
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,v=`
            uniform sampler2D tDiffuse;
            uniform float uTime;
            uniform float uScrollProgress;
            varying vec2 vUv;

            void main() {
                // Cheap, smooth distortion using simple trigonometric functions instead of heavy Simplex Math
                // We layer a few sine waves for that "drifting" feel at 1/10th the performance cost
                float timeXY = uTime * 0.15;
                float driftX = sin(vUv.y * 5.0 + timeXY) * 0.015 + cos(vUv.x * 3.0 + timeXY * 0.8) * 0.01;
                float driftY = cos(vUv.x * 4.0 - timeXY) * 0.015 + sin(vUv.y * 2.5 + timeXY * 1.2) * 0.01;
                
                vec2 distortedUv = vUv + vec2(driftX, driftY);
                vec4 texColor = texture2D(tDiffuse, distortedUv);
                
                // Color Shifting (Dark Magenta to Envy Green)
                vec3 darkMagenta = vec3(0.4, 0.0, 0.4);
                vec3 envyGreen = vec3(0.1, 0.8, 0.3);
                
                // Gradient based on UV + simple noise instead of heavy snoise
                float gradientFactor = vUv.x + (driftX * 10.0);
                vec3 targetColor = mix(darkMagenta, envyGreen, clamp(gradientFactor, 0.0, 1.0));
                
                // Luminance-based tinting
                float lum = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
                vec3 colorOverlay = targetColor * lum * 2.5; 
                
                vec3 finalColor = mix(texColor.rgb, colorOverlay, uScrollProgress * 0.9);

                gl_FragColor = vec4(finalColor, texColor.a);
            }
        `,c={tDiffuse:{value:null},uTime:{value:0},uScrollProgress:{value:0}},u=new r.ShaderMaterial({vertexShader:d,fragmentShader:v,uniforms:c,depthWrite:!1,transparent:!0}),m=new r.PlaneGeometry(1,1),f=new r.Mesh(m,u);a.add(f);let w=()=>{let e=2*Math.tan(l.fov*Math.PI/180/2)*5,o=e*(window.innerWidth/window.innerHeight);f.scale.set(1.4*o,1.4*e,1)};w(),s.load("/images/Background_Art.png",e=>{e.colorSpace=r.SRGBColorSpace,c.tDiffuse.value=e});let g=new r.BufferGeometry,p=new Float32Array(600),h=new Float32Array(200);for(let e=0;e<600;e+=3)p[e]=(Math.random()-.5)*20,p[e+1]=(Math.random()-.5)*20,p[e+2]=(Math.random()-.5)*4,h[e/3]=Math.random();g.setAttribute("position",new r.BufferAttribute(p,3)),g.setAttribute("aScale",new r.BufferAttribute(h,1));let y=new r.ShaderMaterial({uniforms:{uTime:{value:0},uScrollProgress:{value:0}},vertexShader:`
                uniform float uTime;
                uniform float uScrollProgress;
                attribute float aScale;
                varying float vAlpha;
                void main() {
                    vec3 pos = position;
                    // Spark upward drift (faster drift for smaller/closer ones)
                    pos.y += mod(uTime * 0.5 * aScale, 20.0) - 10.0; 
                    
                    // Sway side to side. When 'crouched', we multiply the sway amplitude by 
                    // scroll progress to make it feel like "energy" is gathering
                    float swayAmp = 0.2 + (uScrollProgress * 0.4);
                    pos.x += sin(uTime * 0.5 + aScale * 10.0) * swayAmp;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    
                    // Particles grow slightly larger when you scroll down to simulate intensity
                    float pointSize = (6.0 * aScale) + (uScrollProgress * 5.0);
                    gl_PointSize = pointSize * (15.0 / - mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Fade based on z-depth to avoid popping as camera zooms
                    vAlpha = smoothstep(-3.0, 1.0, mvPosition.z);
                }
            `,fragmentShader:`
                varying float vAlpha;
                uniform float uScrollProgress;
                void main() {
                    // Create a soft circle / glow
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    if (dist > 0.5) discard;
                    
                    float alpha = (0.5 - dist) * 2.0;
                    
                    // Sparks will also tint slightly greener/magenta when scrolled into crouch
                    vec3 baseColor = vec3(1.0, 0.9, 0.7); // warm default sparks
                    vec3 targetColor = mix(vec3(0.8, 0.1, 0.8), vec3(0.1, 0.9, 0.4), coord.x + 0.5); // magenta/green
                    vec3 finalColor = mix(baseColor, targetColor, uScrollProgress * 0.7);

                    gl_FragColor = vec4(finalColor, alpha * vAlpha * 0.5);
                }
            `,transparent:!0,blending:r.AdditiveBlending,depthWrite:!1}),S=new r.Points(g,y);a.add(S);let P=0,x=0,C=0,M=0,A=0,b=0,T=e=>{C=e.clientX/window.innerWidth*2-1,M=-(2*(e.clientY/window.innerHeight))+1},z=()=>{b=Math.min(Math.max(window.scrollY/500,0),1)};window.addEventListener("mousemove",T,{passive:!0}),window.addEventListener("scroll",z,{passive:!0}),z();let U=new r.Clock,W=()=>{let e=U.getElapsedTime();if(b>.85){o=requestAnimationFrame(W);return}c.uTime.value=e,y.uniforms.uTime.value=e,A+=(b-A)*.05,c.uScrollProgress.value=A,y.uniforms.uScrollProgress.value=A,P+=(C-P)*.05,x+=(M-x)*.05,l.position.x=.4*P,l.position.y=.4*x,l.position.z=5-1.5*A,l.position.y-=.3*A,l.updateProjectionMatrix(),n.render(a,l),o=requestAnimationFrame(W)};W();let k=()=>{n.setSize(window.innerWidth,window.innerHeight),l.aspect=window.innerWidth/window.innerHeight,l.updateProjectionMatrix(),w()};return window.addEventListener("resize",k),()=>{window.removeEventListener("mousemove",T),window.removeEventListener("scroll",z),window.removeEventListener("resize",k),cancelAnimationFrame(o),f.geometry.dispose(),u.dispose(),g.dispose(),y.dispose(),n.dispose(),c.tDiffuse.value&&c.tDiffuse.value.dispose()}},[]),(0,o.jsx)("canvas",{ref:e,className:"fixed top-0 left-0 w-full h-full z-0 pointer-events-none",style:{touchAction:"none"}})}e.s(["default",()=>n])},10368,e=>{e.n(e.i(89798))}]);