package com.memoflow.memoflow.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.modelmapper.Condition;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.modelmapper.spi.MappingContext;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        Condition<Object, Object> skipEmptyStrings = new Condition<Object, Object>() {
            @Override
            public boolean applies(MappingContext<Object, Object> context) {
                Object source = context.getSource();
                if (source instanceof String) {
                    return StringUtils.hasText((String) source);
                }
                return true;
            }
        };

        Condition<Object, Object> skipDifferentTypes = new Condition<Object, Object>() {
            @Override
            public boolean applies(MappingContext<Object, Object> context) {
                Class<?> sourceType = context.getSourceType();
                Class<?> destinationType = context.getDestinationType();

                if ((sourceType == double.class && destinationType == Double.class) ||
                        (sourceType == Double.class && destinationType == double.class) ||
                        (sourceType == int.class && destinationType == Integer.class) ||
                        (sourceType == Integer.class && destinationType == int.class)) {
                    return true;
                }

                return sourceType.equals(destinationType);
            }
        };

        Condition<Object, Object> combinedCondition = new Condition<Object, Object>() {
            @Override
            public boolean applies(MappingContext<Object, Object> context) {
                return skipEmptyStrings.applies(context) && skipDifferentTypes.applies(context);
            }
        };

        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setSkipNullEnabled(true)
                .setPropertyCondition(combinedCondition);

        return modelMapper;
    }
}