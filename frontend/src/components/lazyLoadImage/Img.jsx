import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import loadingGif from "../../../public/loadinggif.gif";

const Img = ({ src, className, ...props }) => {
    return (
        <LazyLoadImage
            className={className || ""}
            alt="lastminute scsit content"
            effect="blur"
            src={src}
            height={"90%"}
            width={"100%"}
            placeholderSrc={loadingGif}
            {...props}
        />
    );
};

export default Img;