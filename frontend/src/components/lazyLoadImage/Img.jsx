import React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import loadingGif from "../../../public/loadinggif.gif";

const Img = ({ src, className }) => {
    return (
        <LazyLoadImage
            className={className || ""}
            alt="lastminute image"
            effect="blur"
            src={src}
            placeholderSrc={loadingGif}
        />
    );
};

export default Img;
