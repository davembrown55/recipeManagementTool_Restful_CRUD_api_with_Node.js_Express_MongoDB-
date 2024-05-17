import React, { useState } from 'react';

export const withHooks = (Component) => {
    function ComponentWithHooksProp(props) {
      let uState = useState();
    //   const [selectedSearchOption, setSelectedSearchOption] = useState('title');

      return <Component {...props} hooks={{ uState}} />;
    }
    return ComponentWithHooksProp;
  };

//   import { useLocation, useNavigate, useParams } from "react-router-dom";

// export const withRouter = (Component) => {
//   function ComponentWithRouterProp(props) {
//     let location = useLocation();
//     let navigate = useNavigate();
//     let params = useParams();
//     return <Component {...props} router={{ location, navigate, params }} />;
//   }
//   return ComponentWithRouterProp;
// };
