import { Manifest } from 'c2pa-react-component-types';
import CreativeWork from "./CreativeWork/CreativeWork";
import { CAWG_Header } from "../../CAWG_Header";
import "../styles/cawg.css";

export interface CAWGL3Props {
    manifest: Manifest;
    moreInfo?: () => void;
}

export default function CAWGL3({ manifest, moreInfo }: CAWGL3Props) {
    const title = manifest.title;
    const claimGenerator = manifest.claimGenerator ? manifest.claimGenerator : manifest.claimGeneratorInfo?.[0]?.name ?? "Unknown Claim Generator";
    const claimGeneratorInitials = claimGenerator ? claimGenerator.split(" ").map((n) => n[0].toUpperCase()).join("") : "UCG";

    return (
        <div className="cawg-card">
            <CAWG_Header />
            <div className="cawg-container">
                {
                    manifest.thumbnail ? (
                        <img src={manifest.thumbnail} alt="Thumbnail" className="cawg-thumbnail" />
                    ) : (
                        <div className="cawg-square">
                            <span className="cawg-logo-text">{claimGeneratorInitials}</span>
                        </div>
                    )
                }

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                        <span className="cawg-media-title">{title}</span>
                    </div>
                    <div>
                        <span className="cawg-claim-generator">{claimGenerator}</span>
                    </div>
                </div>
            </div>
            
            <CreativeWork manifest={manifest} />
            
            {moreInfo && <div style={{ marginTop: 16 }}>
                <button onClick={moreInfo} className="cawg-button">
                    Small View
                </button>
            </div>}
        </div>
    );
}
