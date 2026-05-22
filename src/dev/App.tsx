import { CAWGManifest } from '../components/Cawg/Cawg'
import { VerificationOutcome } from "c2pa-react-component-types"

const sampleManifest:VerificationOutcome ={
  "state": false,
  "manifests": [
    {
      "id": "urn:c2pa:0d166542-7288-4833-9662-9487f3dbd048",
      "title": "Test Document",
      "claimGenerator": null,
      "claimGeneratorInfo": [
        {
          "name": "test_generator",
          "org.contentauth.c2pa_rs": "0.80.0"
        }
      ],
      "instanceId": "xmp:iid:888e39d4-945c-4dbc-9c20-799265e8123b",
      "signatureInfo": {
        "alg": "Es256",
        "issuer": "C2PA Test Signing Cert",
        "common_name": "C2PA Signer",
        "cert_serial_number": "640229841392226413189608867977836244731148734950"
      },
      "assertions": {
        "c2pa.actions.v2": {
          "actions": [
            {
              "action": "c2pa.created"
            }
          ]
        },
        "stds.schema-org.CreativeWork": {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "author": [
            {
              "@type": "Person",
              "name": "Matthew Rappard"
            }
          ],
          "publisher": {
            "@type": "Organization",
            "name": "Example Publisher"
          },
          "name": "Test Document"
        }
      },
      "credentials": [],
      "thumbnail": null,
      "ingredients": []
    }
  ],
  "manifestStore": {
    "activeManifest": "urn:c2pa:0d166542-7288-4833-9662-9487f3dbd048",
    "manifests": {
      "urn:c2pa:0d166542-7288-4833-9662-9487f3dbd048": {
        "claimGenerator": null,
        "claimGeneratorInfo": [
          {
            "name": "test_generator",
            "org.contentauth.c2pa_rs": "0.80.0"
          }
        ],
        "title": "Test Document",
        "instanceId": "xmp:iid:888e39d4-945c-4dbc-9c20-799265e8123b",
        "signatureInfo": {
          "alg": "Es256",
          "issuer": "C2PA Test Signing Cert",
          "common_name": "C2PA Signer",
          "cert_serial_number": "640229841392226413189608867977836244731148734950"
        }
      }
    }
  }
}




export default function App() {
  return (
    <div style={{ maxWidth: '960px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>C2PA React Components – Dev Playground</h1>
      <h2>Provenance Graph</h2>
      {/*<C2paProvenanceGraph manifest={sampleManifest} height={400} />*/}
      <h2 style={{ marginTop: '2rem' }}>Disclosure Levels</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {([1, 2, 3] as const).map((l) => (
          <div key={l}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#475569' }}>Level {l}</p>
            <CAWGManifest
              manifest={sampleManifest}
              level={l}
              onViewMore={l === 2 ? () => alert('Navigate to L3') : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
