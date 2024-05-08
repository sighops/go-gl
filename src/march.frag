#version 410
uniform float u_time;
uniform vec2  u_resolution;
uniform vec2 u_scale;
out vec4 fragColor;

const int MAX_STEPS = 128;
const float STEP_SCALE = 0.75;
const float eps = 0.005;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Rotates a point t radians around the y-axis
vec3 rotateY(vec3 v, float t)
{
  float cost = cos(t); float sint = sin(t);
  return vec3(v.x * cost + v.z * sint, v.y, -v.x * sint + v.z * cost);
}

// Rotates a point t radians around the x-axis
vec3 rotateX(vec3 v, float t)
{
  float cost = cos(t); float sint = sin(t);
  return vec3(v.x, v.y * cost - v.z * sint, v.y * sint + v.z * cost);
}

float torus( vec3 p, vec2 t )
{
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdCylinder( vec3 p, vec3 c )
{
  return length(p.xz-c.xy)-c.z;
}

float sdPlane( vec3 p, vec4 n )
{
  // n must be normalized
  return dot(p,n.xyz) + n.w;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float sphere(vec3 p, vec3 center, float radius)
{
  return length(p - center) - radius;
}

float sinusoid(vec3 p)
{
  return cos(p.x*3.+sin(u_time)*0.7)* sin(p.y*3.+sin(u_time)*0.4) * cos(p.z*-3+sin(u_time)*0.4)
          + 0.8*cos(p.x*18.+sin(u_time)*1.4) * sin(p.y*18.+sin(u_time)*0.4) * cos(p.z*-18.+sin(u_time)*0.8);
}

float scene(vec3 p)
{
  //return torus(p, vec2(0.3, 0.8));
  //return sphere(p, vec3(0.0, 0.0, 9.0), 4.0) + cos(5.0+sin(u_time/4)*2.5 * p.x) * sin(5.0+cos(u_time/4)*2.5 * p.y) * cos(5.0+sin(u_time/4)*2.5 * p.z) * 0.25;
  //return sphere(p, vec3(0.0, 0.0, 9.0), 4.0) + 0.4*sinusoid(p);
  return min(
              max(sdBox(p, vec3(.5,0.8,0.5)),
                  -sphere(p, vec3(cos(u_time)*0.2+0.0, cos(u_time/4)*-2.0, cos(u_time)*0.1+0.0), .75) + 0.04*sinusoid(p)),
              sphere(p, vec3(cos(u_time)*0.2+0.0, cos(u_time/4)*-2.0, cos(u_time)*0.1+0.0), .3) + 0.1*sinusoid(p)
            );
  //return torus(p, vec2(0.7,0.2)) + 0.2*sinusoid(p);
  //return sdPlane(p, vec4(0.0,0.0,.1,0.1));
}

float march(vec3 origin, vec3 direction, float start, float end)
{
  float sceneDist = 0.0;
  float rayDepth = start;

  for (int i = 0; i < MAX_STEPS; i++) {
    sceneDist = scene( origin + direction * rayDepth);

    if(rayDepth >= end) {
      break;
    }

    rayDepth += sceneDist * STEP_SCALE;

  }

  return rayDepth;
}

vec3 getNormal(in vec3 p)
{

  return normalize(vec3(
    scene(vec3(p.x+eps,p.y,p.z))-scene(vec3(p.x-eps,p.y,p.z)),
    scene(vec3(p.x,p.y+eps,p.z))-scene(vec3(p.x,p.y-eps,p.z)),
    scene(vec3(p.x,p.y,p.z+eps))-scene(vec3(p.x,p.y,p.z-eps))
  ));
}

void main()
{
  vec3 cameraPos = vec3(sin(u_time/4)*-2.0, 0.5, cos(u_time/4)*-2.0);
  vec3 cameraLookAt = vec3(0.0, 0.0, 0.0);
  vec2 aspectRatio = vec2(u_resolution.x/u_resolution.y, 1.0);
  vec2 screenCoords = vec2(2 * gl_FragCoord.xy/u_resolution.xy - 1.0) * aspectRatio;
  float FOV = 0.5;

  vec3 rayOrigin = cameraPos;
  vec3 forward = normalize(cameraLookAt - cameraPos);
  vec3 right = normalize(vec3(forward.z, 0.0, -forward.x));
  vec3 up = normalize(cross(forward,right));
  vec3 rayDir = normalize(forward + FOV*screenCoords.x*right + FOV*screenCoords.y*up);

  float clipNear = 0.0;
  float clipFar = 10.0;

  vec3 bgColor = vec3(0.0, 0.0, 0.0);

  float dist = march(rayOrigin, rayDir, clipNear, clipFar);

  if (dist >= clipFar) {
    fragColor = vec4(bgColor, 1.0);
    return;
  }

  vec3 surfacePos = rayOrigin + rayDir*dist;
  vec3 surfaceNormal = getNormal(surfacePos);

  vec3 lightPos = vec3(sin(u_time/4)*-2.0,1.0, cos(u_time/4)*-2.0);

  vec3 lightDir = lightPos-surfacePos;

  vec3 lightColor = vec3(1.,0.97,0.92);

  vec3 ref = reflect(-lightDir, surfaceNormal);
  float diffuse = max( 0.0, dot(surfaceNormal, lightDir) );
  float specular = max( 0.0, dot( ref, normalize(cameraPos-surfacePos)) );

  vec3 spherecolor = vec3(abs(sin(u_time/2))*0.5, abs(cos(u_time/2))*0.5,abs(sin(u_time/4))*0.5) * (diffuse*.7) + specular*0.01;
  fragColor = vec4(spherecolor,1.0);
}