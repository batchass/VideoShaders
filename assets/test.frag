#version 110
#extension GL_ARB_texture_rectangle : enable

uniform vec3			iResolution;           // viewport resolution (in pixels)
uniform sampler2DRect	iChannel0;
uniform sampler2DRect	iChannel1;
uniform sampler2DRect	iChannel2;
uniform vec3			iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
uniform int				width;
uniform int				height;
uniform float			iGlobalTime;           // shader playback time (in seconds)


void main(void)
{
	vec2 uv = gl_TexCoord[0].st* vec2(width*2,height);
	vec2 uvCat =  gl_TexCoord[0].st* vec2(width,height);
	vec2 uvBrit = gl_TexCoord[0].st* vec2(width,height); 

	float run = .08 + (.32 * abs(sin(iGlobalTime)));
	run = floor(run * 30.0) / 30.0;
	
	uvCat = (uvCat - vec2(run,0.0)) / 
		    (vec2(1.02,0.9) - vec2(0.5,0.15));	

	uvCat = clamp( uvCat, 0.0, 1.0 );
	
	// look where you're going kitty
	if( sin(2.0 * iGlobalTime) < 0.0){
		uvCat.x = 1.0 - uvCat.x;
	}
	
	float ofx = floor( mod( iGlobalTime * 12.0, 6.0 ) );
	float ww = 40.0 / 256.0;
	
	uvCat.x = (uvCat.x * ww) + (ofx * ww);
	uvCat.y = 1.0 - uvCat.y;
	
	uvBrit.y -= .4;
	
	vec4 fg   = texture2DRect( iChannel0, uvCat );
	
	float londonZoom = .4;
	float lz = londonZoom + (floor(sin(iGlobalTime/4.0)+1.0) * (1.0-londonZoom));
		
	vec4 bg   = texture2DRect( iChannel1, uv * vec2(lz) );
	vec4 brit = texture2DRect( iChannel2, uvBrit);
	
	float britMix = 0.6;
	float thresh = .3;
	if( brit[0] < thresh &&	brit[1] > thresh && brit[2] < thresh ){
			britMix = 0.0;
	}
	
	float skyMix = 0.0;
	float skyThresh = .9;
	if( bg[0] > skyThresh && bg[1] > skyThresh && bg[2] > skyThresh && uv.y  < -.5 ){
			skyMix = 1.0;
	}
	
	//iq contact shadow from comments
	//16.2.13
	float occ = length( (uv - vec2(-0.25-run,-0.12))*vec2(2.0,6.0) ); 
	bg *= 0.3 + 0.7*smoothstep( 0.3, 0.9, occ );

	float rr = (sin(iGlobalTime) + 1.0)*.5;
	float gg = (sin(iGlobalTime  + 4.0)+1.0)*.5;
	float bb = (sin(iGlobalTime  + 3.0)+1.0)*.5;
	
	vec4 sky = vec4(rr, gg, bb, 1.0);
	vec4 col = mix(fg, bg, 1.0 - fg.w);
	vec4 britSky = mix(sky, brit, britMix);
	col = mix(col, britSky, skyMix);
	
	gl_FragColor = col;
	//passthru begin
	//vec2 uv = gl_TexCoord[0].st* vec2(width,height);
    //gl_FragColor = texture2DRect(iChannel2, uv);
	//gl_FragColor.a = 1.0;
	//passthru end

	//vec2 uv    = -gl_FragCoord.xy / iResolution.xy;
	//vec2 uvCat =  gl_FragCoord.xy / iResolution.xy;
	//vec2 uvBrit = gl_FragCoord.xy / iResolution.xy; 
	//PAUL
	//vec4 color0 = texture2DRect( iChannel0, gl_TexCoord[0].st );
	//vec4 color1 = texture2DRect( iChannel1, gl_TexCoord[0].st );
	//color0.rgb = vec3(1.0) - color0.rgb;
	//color1.a = 0.5;
	//vec4 result = mix(color0, color1, color1.a);
	//gl_FragColor.rgb = result.rgb;
	//gl_FragColor.a = 1.0;
	//PAUL



}